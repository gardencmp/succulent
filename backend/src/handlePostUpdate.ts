import { Account, ID, ImageDefinition, Me } from 'jazz-tools';
import { InstagramScheduleDesired, Post } from './sharedDataModel';
import { ActuallyScheduled } from '.';

export const handlePostUpdate = (
  actuallyScheduled: ActuallyScheduled,
  loadedImages: Map<
    ImageDefinition['id'],
    { mimeType?: string; chunks: Uint8Array[] }
  >,
  worker: Account & Me
) => {
  return async function handlePostUpdateInner(post: Post) {
    if (!post.instagram?.state) return;
    if (actuallyScheduled.get(post.id)?.state === 'posting') {
      console.log(
        new Date(),
        'ignoring update to currently posting post',
        post.id
      );
      return;
    }

    if (
      post.instagram.state === 'posted' ||
      post.instagram.state === 'notScheduled'
    ) {
      if (actuallyScheduled.has(post.id)) {
        console.log(
          `Post ${post.content?.split('\n')[0].slice(0, 20)}/${
            post.id
          } is now ${post.instagram.state}, removing from actuallyScheduled`
        );
        actuallyScheduled.delete(post.id);
      }
    }

    if (post.instagram.state === 'scheduled') {
      const actuallyScheduledPost = actuallyScheduled.get(post.id);
      if (
        !(
          actuallyScheduledPost?.state === 'ready' ||
          actuallyScheduledPost?.state === 'imagesNotLoaded' ||
          actuallyScheduledPost?.state === 'loadingImages'
        ) ||
        post.content !== actuallyScheduledPost.content ||
        post.images?.map((image) => image?.imageFile?.id).join() !==
          actuallyScheduledPost.imageFileIds.join() ||
        post.instagram.scheduledAt !==
          actuallyScheduledPost.scheduledAt.toISOString()
      ) {
        console.log(
          new Date(),
          'Got previously scheduled post, or scheduled post that changed, resetting to scheduleDesired',
          post.id
        );
        actuallyScheduled.delete(post.id);
        post.instagram = {
          state: 'scheduleDesired',
          scheduledAt: post.instagram.scheduledAt,
        };
      }
    } else if (post.instagram.state === 'scheduleDesired') {
      if (
        new Date(post.instagram.scheduledAt).getTime() >=
        Date.now() - 1000 * 60 * 5
      ) {
        actuallyScheduled.set(post.id, {
          state: 'imagesNotLoaded',
          content: post.content || '',
          imageFileIds:
            post.images
              ?.map((image) => image?.imageFile?.id)
              .filter((i): i is NonNullable<typeof i> => !!i) || [],
          scheduledAt: new Date(post.instagram.scheduledAt),
          post: post as Post<InstagramScheduleDesired>,
        });
      } else {
        console.log(
          new Date(),
          '⚠️ Ignoring scheduleDesired post that is older than 5 minutes',
          post.id,
          post.content?.split('\n')[0].slice(0, 20)
        );
      }
    }
  };
};
