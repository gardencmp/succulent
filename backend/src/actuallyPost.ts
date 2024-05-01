import { Account, ID, ImageDefinition, Me } from 'jazz-tools';
import { Image, Post } from '../sharedDataModel';
import { ActuallyScheduled } from '.';

export async function actuallyPost(
  as: Account & Me,
  postId: ID<Post>,
  actuallyScheduled: ActuallyScheduled,
  state: {
    state: 'ready';
    content: string;
    imageFileIds: ID<ImageDefinition>[];
    scheduledAt: Date;
  },
  fetchImpl: typeof fetch
) {
  try {
    const post = await Post.load(postId, { as });
    if (!post) throw new Error('post unavailable');

    try {
      if (!post.inBrand) throw new Error('no brand');

      const brand = await post._refs.inBrand.load();
      if (!brand) throw new Error('brand unavailable');
      if (!brand.instagramAccessToken) throw new Error('no access token');
      if (!brand.instagramPage) throw new Error('no instagram page');
      const accessToken = brand.instagramAccessToken;
      const igPage = brand.instagramPage.id;
      const backendAddr =
        process.env.SUCCULENT_BACKEND_ADDR || 'http://localhost:3331';

      // TODO: fetch tags & location

      let topContainerId;

      if (state.imageFileIds.length === 1) {
        const url = new URL(`https://graph.facebook.com/v18.0/${igPage}/media`);
        url.searchParams.set('access_token', accessToken);
        url.searchParams.set('caption', post.content || '');
        url.searchParams.set(
          'image_url',
          backendAddr + '/image/' + state.imageFileIds[0]
        );
        console.log(new Date(), 'POST', url.toString());
        const res = await fetchImpl(url, {
          method: 'POST',
        });
        if (res.status !== 200)
          throw new Error(
            'FB API error ' + res.status + ': ' + (await res.text())
          );
        topContainerId = ((await res.json()) as { id: string }).id;
      } else {
        const containerIds = await Promise.all(
          state.imageFileIds.map(async (imageFileId) => {
            const url = new URL(
              `https://graph.facebook.com/v18.0/${igPage}/media`
            );
            url.searchParams.set('access_token', accessToken);
            url.searchParams.set(
              'image_url',
              backendAddr + '/image/' + imageFileId
            );

            console.log(new Date(), 'POST', url.toString());

            const res = await fetchImpl(url, {
              method: 'POST',
            });
            if (res.status !== 200)
              throw new Error(
                'FB API error ' + res.status + ': ' + (await res.text())
              );
            const containerId = ((await res.json()) as { id: string }).id;

            return containerId;
          })
        );

        const url = new URL(`https://graph.facebook.com/v18.0/${igPage}/media`);
        url.searchParams.set('access_token', accessToken);
        url.searchParams.set('caption', post.content || '');
        url.searchParams.set('media_type', 'CAROUSEL');
        url.searchParams.set('children', containerIds.join(','));

        console.log(new Date(), 'POST', url.toString());
        const res = await fetchImpl(url, {
          method: 'POST',
        });
        if (res.status !== 200)
          throw new Error(
            'FB API error ' + res.status + ': ' + (await res.text())
          );
        topContainerId = ((await res.json()) as { id: string }).id;
      }

      if (!topContainerId) throw new Error('no container id');

      const url = new URL(
        `https://graph.facebook.com/v18.0/${igPage}/media_publish`
      );
      url.searchParams.set('access_token', accessToken);
      url.searchParams.set('creation_id', topContainerId);

      console.log(new Date(), 'POST', url.toString());
      const res = await fetchImpl(url, {
        method: 'POST',
      });
      if (res.status !== 200)
        throw new Error(
          'FB API error ' + res.status + ': ' + (await res.text())
        );
      const postMediaId = ((await res.json()) as { id: string }).id;

      if (!postMediaId) throw new Error('no post media id');

      const permalinkReqUrl = new URL(
        `https://graph.facebook.com/v18.0/${postMediaId}`
      );
      permalinkReqUrl.searchParams.set('access_token', accessToken);
      permalinkReqUrl.searchParams.set('fields', 'permalink');

      console.log(new Date(), 'GET', permalinkReqUrl);
      const permalinkRes = await fetchImpl(permalinkReqUrl);
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
