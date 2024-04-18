import { CoID, Media, LocalNode } from 'cojson';
import { Image, Post } from '../sharedDataModel';

export async function actuallyPost(
  node: LocalNode,
  postId: CoID<Post>,
  actuallyScheduled: Map<
    CoID<Post>,
    | { state: 'posting' }
    | {
        state: 'ready';
        content: string;
        imageFileIds: CoID<Media.ImageDefinition>[];
        scheduledAt: Date;
      }
  >,
  state: {
    state: 'ready';
    content: string;
    imageFileIds: CoID<Media.ImageDefinition>[];
    scheduledAt: Date;
  }
) {
  try {
    const post = await node.load(postId);
    if (post === 'unavailable') throw new Error('post unavailable');

    try {
      if (!post.get('inBrand')) throw new Error('no brand');

      const brand = await node.load(post.get('inBrand')!);
      if (brand === 'unavailable') throw new Error('brand unavailable');

      const imagesListId = post.get('images');
      if (!imagesListId) throw new Error('no images');
      const imagesList = await node.load(imagesListId);

      if (imagesList === 'unavailable') throw new Error('images unavailable');
      const maybeImages = await Promise.all(
        imagesList.asArray().map((imageId) => node.load(imageId))
      );

      if (maybeImages.some((image) => image === 'unavailable'))
        throw new Error('image unavailable');

      const images = maybeImages as Image[];

      if (images.length === 0) {
        throw new Error('no images');
      }

      let topContainerId;

      if (images.length === 1) {
        const url = `https://graph.facebook.com/v18.0/${brand.get(
          'instagramPage'
        )?.id}/media?caption=${encodeURIComponent(
          post.get('content') || ''
        )}&image_url=${encodeURIComponent(
          (process.env.SUCCULENT_BACKEND_ADDR || 'http://localhost:3331') +
            '/image/' +
            images[0].get('imageFile')
        )}&access_token=${brand.get('instagramAccessToken'
        )}&user_tags=${encodeURIComponent(
          JSON.stringify(post.get('tags') || [])
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
            const existingContainerId = image.get('instagramContainerId');
            // if (existingContainerId) {
            //     return existingContainerId;
            // } else {
            const url = `https://graph.facebook.com/v18.0/${brand.get(
              'instagramPage'
            )?.id}/media?image_url=${encodeURIComponent(
              (process.env.SUCCULENT_BACKEND_ADDR || 'http://localhost:3331') +
                '/image/' +
                image.get('imageFile')
            )}&access_token=${brand.get('instagramAccessToken')}`;

            console.log(new Date(), 'POST', url);

            const res = await fetch(url, {
              method: 'POST',
            });
            if (res.status !== 200)
              throw new Error(
                'FB API error ' + res.status + ': ' + (await res.text())
              );
            const containerId = ((await res.json()) as { id: string }).id;

            image.set('instagramContainerId', containerId);

            return containerId;
            // }
          })
        );

        const url = `https://graph.facebook.com/v18.0/${brand.get(
          'instagramPage'
        )?.id}/media?caption=${encodeURIComponent(
          post.get('content') || ''
        )}&media_type=CAROUSEL&children=${containerIds.join(
          '%2C'
        )}&access_token=${brand.get('instagramAccessToken')}`;
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

      const url = `https://graph.facebook.com/v18.0/${brand.get('instagramPage')
        ?.id}/media_publish?creation_id=${topContainerId}&access_token=${brand.get(
        'instagramAccessToken'
      )}`;
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

      const permalinkReqUrl = `https://graph.facebook.com/v18.0/${postMediaId}?fields=permalink&access_token=${brand.get(
        'instagramAccessToken'
      )}`;
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

      post.set('instagram', {
        state: 'posted',
        postedAt: new Date().toISOString(),
        postId: postMediaId,
        permalink: postPermalink,
      });

      actuallyScheduled.delete(postId);
    } catch (e) {
      console.error(new Date(), 'Error posting after post load', postId, e);
      post.set('instagram', {
        state: 'scheduleDesired',
        scheduledAt: state.scheduledAt.toISOString(),
        notScheduledReason: e + '',
      });
    }
  } catch (e) {
    console.error(new Date(), 'Error posting - no post info at all', postId, e);
    actuallyScheduled.delete(postId);
  }
}
