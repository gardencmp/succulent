import 'dotenv/config';

import { createOrResumeWorker } from 'jazz-nodejs';
import { ID, ImageDefinition } from 'jazz-tools';

import { Post } from '../sharedDataModel';
import { logAccountState } from './logAccountState';
import { loadImageFile } from './loadImageFile';
import { actuallyPost } from './actuallyPost';
import { handleImageRequest } from './handleImageRequest';
import { handleFBConnectRequest } from './handleFBConnectRequest';
import { CoMap, CoStream, co } from 'jazz-tools';
import { SchedulerAccount } from './workerAccount';

async function runner() {
  // TODO: make sure this is inferred
  const { worker } = await createOrResumeWorker<SchedulerAccount>({
    workerName: 'SucculentScheduler',
    accountSchema: SchedulerAccount,
  });

  const actuallyScheduled = new Map<
    Post['id'],
    | { state: 'posting' }
    | {
        state: 'ready';
        content: string;
        imageFileIds: ID<ImageDefinition>[];
        scheduledAt: Date;
      }
  >();
  const loadedImages = new Map<
    ImageDefinition['id'],
    { mimeType?: string; chunks: Uint8Array[] }
  >();

  console.log(new Date(), 'root after migration', worker.root);

  const postErrorTimeouts = new Map<Post['id'], NodeJS.Timeout>();

  worker.subscribe(async (workerSub) => {
    if (workerSub?.root?.scheduledPosts) {
      logAccountState(workerSub);

      for (let perSession of Object.entries(
        workerSub.root.scheduledPosts.perSession
      )) {
        for (let post of perSession[1].all satisfies { value: Post }[] as {
          value: Post;
        }[]) {
          if (!post?.value?.instagram?.state || !post.value.id) continue;
          if (actuallyScheduled.get(post.value.id)?.state === 'posting') {
            console.log(
              new Date(),
              'ignoring update to currently posting post',
              post.value.id
            );
            continue;
          }

          if (post.value.instagram.state === 'scheduled') {
            const actuallyScheduledPost = actuallyScheduled.get(post.value.id);
            if (
              actuallyScheduledPost?.state !== 'ready' ||
              post.value.content !== actuallyScheduledPost.content ||
              post.value.images?.map((image) => image?.imageFile?.id).join() !==
                actuallyScheduledPost.imageFileIds.join() ||
              post.value.instagram.scheduledAt !==
                actuallyScheduledPost.scheduledAt.toISOString()
            ) {
              console.log(
                new Date(),
                'Got previously scheduled post, or scheduled post that changed, resetting to scheduleDesired',
                post.value.id
              );
              actuallyScheduled.delete(post.value.id);
              post.value.instagram = {
                state: 'scheduleDesired',
                scheduledAt: post.value.instagram.scheduledAt,
              };
            }
          } else if (post.value.instagram.state === 'scheduleDesired') {
            console.log(
              new Date(),
              'Update, deleting from actually scheduled',
              post.value.id
            );
            actuallyScheduled.delete(post.value.id);
            console.log(new Date(), 'loading images', post.value.id);
            const streams =
              post.value.images &&
              (await Promise.all(
                post.value.images.map(
                  async (image) =>
                    image?.imageFile?.id && {
                      id: image.imageFile.id,
                      ...(await loadImageFile(node, image.imageFile.id)),
                    }
                )
              ));

            if (
              streams &&
              streams.length > 0 &&
              streams.every((stream) => stream)
            ) {
              for (let stream of streams) {
                loadedImages.set(stream!.id, {
                  mimeType: stream!.mimeType,
                  chunks: stream!.chunks!,
                });
              }
              console.log(
                new Date(),
                'images loaded, adding to actually scheduled',
                post.value.id
              );
              actuallyScheduled.set(post.value.id, {
                state: 'ready',
                content: post.value.content || '',
                imageFileIds: post.value.images!.map(
                  (image) => image!.imageFile!.id
                ),
                scheduledAt: new Date(post.value.instagram.scheduledAt),
              });
              if (post.value.instagram.state === 'scheduleDesired') {
                post.value.set('instagram', {
                  state: 'scheduled',
                  scheduledAt: post.value.instagram.scheduledAt,
                });
              }
            } else {
              console.log(
                new Date(),
                'One or several images unavailable',
                post.value.id,
                streams
              );
              const erroredPost = post.value;
              if (postErrorTimeouts.get(erroredPost.id)) {
                clearTimeout(postErrorTimeouts.get(erroredPost.id)!);
              }
              postErrorTimeouts.set(
                erroredPost.id,
                setTimeout(() => {
                  if (
                    erroredPost.instagram.state === 'notScheduled' ||
                    erroredPost.instagram.state === 'posted'
                  )
                    return;
                  erroredPost.set('instagram', {
                    state: 'scheduleDesired',
                    scheduledAt: erroredPost.instagram.scheduledAt,
                    notScheduledReason:
                      'One or several images unavailable as of ' +
                      new Date().toISOString(),
                  });
                }, 1_000)
              );
            }
          }
        }
      }
    }
  });

  Bun.serve({
    async fetch(req) {
      if (req.url.includes('/connectFB')) {
        return handleFBConnectRequest(req);
      } else if (req.url.includes('/image/')) {
        return handleImageRequest(req, loadedImages);
      } else {
        return new Response('not found', { status: 404 });
      }
    },
    port: 3331,
  });

  let tryN = 0;

  const tryPosting = async () => {
    if (tryN % 10 === 0) {
      console.log(new Date(), 'actuallyScheduled', actuallyScheduled);
    }
    tryN++;

    if (process.env.NODE_ENV === 'development') {
      console.log(new Date(), 'not actually scheduling in dev mode');
      return;
    }

    for (let [postId, state] of actuallyScheduled.entries()) {
      if (state.state === 'ready' && state.scheduledAt < new Date()) {
        console.log(new Date(), 'posting', postId);
        if (process.env.ARMED === 'true') {
          actuallyScheduled.set(postId, { state: 'posting' });
          await actuallyPost(node, postId, actuallyScheduled, state);
        } else {
          console.log(
            new Date(),
            postId,
            JSON.stringify(state),
            'not actually posting in unarmed mode'
          );
        }
      }
    }

    setTimeout(tryPosting, 10_000);
  };
  setTimeout(tryPosting, 10_000);
}

runner();
