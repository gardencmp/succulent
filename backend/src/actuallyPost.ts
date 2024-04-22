import { Account, ID, ImageDefinition, Me } from 'jazz-tools';
import { Image, Post } from '../sharedDataModel';

export async function actuallyPost(
  as: Account & Me,
  postId: ID<Post>,
  actuallyScheduled: Map<
    ID<Post>,
    | { state: 'posting' }
    | {
        state: 'ready';
        content: string;
        imageFileIds: ID<ImageDefinition>[];
        scheduledAt: Date;
      }
  >,
  state: {
    state: 'ready';
    content: string;
    imageFileIds: ID<ImageDefinition>[];
    scheduledAt: Date;
  }
) {
  try {
    const post = await Post.load(postId, { as });
    if (!post) throw new Error('post unavailable');

    try {
      if (!post.inBrand) throw new Error('no brand');

      const brand = await post._refs.inBrand.load();
      if (!brand) throw new Error('brand unavailable');

      const imagesList = await post._refs.images.load();

      if (!imagesList) throw new Error('images unavailable');
      const maybeImages = await Promise.all(
        [...imagesList._refs].map((imageRef) => imageRef.load())
      );

      if (maybeImages.some((image) => !image))
        throw new Error('image unavailable');

      const images = maybeImages as Image[];

      if (images.length === 0) {
        throw new Error('no images');
      }

      // TODO: fetch tags & location

      let topContainerId;

      if (images.length === 1) {
        const url = `https://graph.facebook.com/v18.0/${brand.instagramPage
          ?.id}/media?caption=${encodeURIComponent(
          post.content || ''
        )}&image_url=${encodeURIComponent(
          (process.env.SUCCULENT_BACKEND_ADDR || 'http://localhost:3331') +
            '/image/' +
            images[0]._refs.imageFile.id
        )}&access_token=${
          brand.instagramAccessToken
        }&user_tags=${encodeURIComponent(
          JSON.stringify(post.tags || [])
        )}&location_id=${encodeURIComponent(
          JSON.stringify(post.location?.fbId)
        )}`;
        console.log(new Date(), 'POST', url);
        const res = await fetch(url, {
          method: 'POST',
        });
        if (res.status !== 200)
          throw new Error(
            'FB API error ' + res.status + ': ' + (await res.text())
          );
        topContainerId = ((await res.json()) as { id: string }).id;
      } else {
        const containerIds = await Promise.all(
          images.map(async (image) => {
            const existingContainerId = image.instagramContainerId;
            // if (existingContainerId) {
            //     return existingContainerId;
            // } else {
            const url = `https://graph.facebook.com/v18.0/${brand.instagramPage
              ?.id}/media?image_url=${encodeURIComponent(
              (process.env.SUCCULENT_BACKEND_ADDR || 'http://localhost:3331') +
                '/image/' +
                image.imageFile
            )}&access_token=${brand.instagramAccessToken}`;

            console.log(new Date(), 'POST', url);

            const res = await fetch(url, {
              method: 'POST',
            });
            if (res.status !== 200)
              throw new Error(
                'FB API error ' + res.status + ': ' + (await res.text())
              );
            const containerId = ((await res.json()) as { id: string }).id;

            image.instagramContainerId = containerId;

            return containerId;
            // }
          })
        );

        const url = `https://graph.facebook.com/v18.0/${brand.instagramPage
          ?.id}/media?caption=${encodeURIComponent(
          post.content || ''
        )}&media_type=CAROUSEL&children=${containerIds.join(
          '%2C'
        )}&access_token=${brand.instagramAccessToken}`;
        console.log(new Date(), 'POST', url);
        const res = await fetch(url, {
          method: 'POST',
        });
        if (res.status !== 200)
          throw new Error(
            'FB API error ' + res.status + ': ' + (await res.text())
          );
        topContainerId = ((await res.json()) as { id: string }).id;
      }

      if (!topContainerId) throw new Error('no container id');

      const url = `https://graph.facebook.com/v18.0/${brand.instagramPage?.id}/media_publish?creation_id=${topContainerId}&access_token=${brand.instagramAccessToken}`;
      console.log(new Date(), 'POST', url);
      const res = await fetch(url, {
        method: 'POST',
      });
      if (res.status !== 200)
        throw new Error(
          'FB API error ' + res.status + ': ' + (await res.text())
        );
      const postMediaId = ((await res.json()) as { id: string }).id;

      if (!postMediaId) throw new Error('no post media id');

      const permalinkReqUrl = `https://graph.facebook.com/v18.0/${postMediaId}?fields=permalink&access_token=${brand.instagramAccessToken}`;
      console.log(new Date(), 'GET', permalinkReqUrl);
      const permalinkRes = await fetch(permalinkReqUrl);
      permalinkRes.status !== 200 &&
        console.error(
          new Date(),
          'error getting permalink',
          permalinkRes.status,
          await permalinkRes.text()
        );

      const postPermalink = (
        (await permalinkRes.json()) as {
          permalink: string;
        }
      ).permalink;

      post.instagram = {
        state: 'posted',
        postedAt: new Date().toISOString(),
        postId: postMediaId,
        permalink: postPermalink,
      };

      actuallyScheduled.delete(postId);
    } catch (e) {
      console.error(new Date(), 'Error posting after post load', postId, e);
      post.instagram = {
        state: 'scheduleDesired',
        scheduledAt: state.scheduledAt.toISOString(),
        notScheduledReason: e + '',
      };
    }
  } catch (e) {
    console.error(new Date(), 'Error posting - no post info at all', postId, e);
    actuallyScheduled.delete(postId);
  }
}
