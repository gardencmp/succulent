import 'dotenv/config';

import { createOrResumeWorker } from 'jazz-nodejs';
import { ID, ImageDefinition } from 'jazz-tools';

import {
  InstagramScheduleDesired,
  InstagramScheduled,
  Post,
} from '../sharedDataModel';
import { actuallyPost } from './actuallyPost';
import { handleImageRequest } from './handleImageRequest';
import { handleFBConnectRequest } from './handleFBConnectRequest';
import { SchedulerAccount } from './workerAccount';
import { handlePostUpdate } from './handlePostUpdate';
import { logAccountState } from './logAccountState';
import { loadImageFile } from './loadImageFile';

export type ActuallyScheduled = Map<
  Post['id'],
  | { state: 'posting' }
  | {
      state: 'imagesNotLoaded';
      content: string;
      imageFileIds: ID<ImageDefinition>[];
      scheduledAt: Date;
      post: Post<InstagramScheduleDesired | InstagramScheduled>;
    }
  | {
      state: 'loadingImages';
      content: string;
      imageFileIds: ID<ImageDefinition>[];
      scheduledAt: Date;
    }
  | {
      state: 'loadingImagesFailed';
    }
  | {
      state: 'ready';
      content: string;
      imageFileIds: ID<ImageDefinition>[];
      scheduledAt: Date;
    }
>;

async function runner() {
  // TODO: make sure this is inferred
  const { worker } = await createOrResumeWorker<SchedulerAccount>({
    workerName: 'SucculentScheduler',
    accountSchema: SchedulerAccount,
  });

  const actuallyScheduled: ActuallyScheduled = new Map();
  const loadedImages = new Map<
    ImageDefinition['id'],
    { mimeType?: string; chunks: Uint8Array[] }
  >();

  console.log(new Date(), 'root after migration', worker.root);

  let tryPostingTimeout: NodeJS.Timeout | undefined;
  let tryLoadingImagesTimeout: NodeJS.Timeout | undefined;

  worker.subscribe((workerUpdate) => {
    if (tryPostingTimeout) {
      clearTimeout(tryPostingTimeout);
    }
    if (tryLoadingImagesTimeout) {
      clearTimeout(tryLoadingImagesTimeout);
    }

    if (workerUpdate?.root?.brands) {
      logAccountState(workerUpdate);

      const seenPosts = [];

      for (let brand of workerUpdate.root?.brands) {
        for (let post of brand?.posts || []) {
          if (post) {
            seenPosts.push(post.id);
            handlePostUpdate(
              actuallyScheduled,
              loadedImages,
              workerUpdate
            )(post);
          }
        }
      }

      for (let postId of actuallyScheduled.keys()) {
        if (!seenPosts.includes(postId)) {
          console.log(
            `No longer seeing ${postId}, removing from actuallyScheduled`
          );
          actuallyScheduled.delete(postId);
        }
      }

      console.log(new Date(), 'actuallyScheduled after workerUpdate');
      logActuallyScheduled(actuallyScheduled);

      tryLoadingImagesTimeout = setTimeout(() => {
        tryLoadingImages();
      }, 10_000);
    }
  });

  Bun.serve({
    async fetch(req) {
      if (req.url.includes('/connectFB')) {
        return handleFBConnectRequest(req, worker);
      } else if (req.url.includes('/image/')) {
        return handleImageRequest(req, loadedImages);
      } else {
        return new Response('not found', { status: 404 });
      }
    },
    port: 3331,
  });

  const tryLoadingImages = async () => {
    console.log(new Date(), 'actuallyScheduled in tryLoadingImages');
    logActuallyScheduled(actuallyScheduled);

    for (let [postId, state] of actuallyScheduled.entries()) {
      if (state.state === 'imagesNotLoaded') {
        console.log(new Date(), 'loading images for', postId);
        actuallyScheduled.set(postId, { ...state, state: 'loadingImages' });

        const streams = await Promise.all(
          state.imageFileIds.map(async (imageId) => ({
            id: imageId,
            ...(await loadImageFile(imageId, {
              as: worker,
            })),
          }))
        );

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
          console.log(new Date(), 'images loaded', postId);
          actuallyScheduled.set(postId, {
            ...state,
            state: 'ready',
          });
          if (state.post.instagram.state === 'scheduleDesired') {
            state.post.instagram = {
              state: 'scheduled',
              scheduledAt: state.post.instagram.scheduledAt,
            };
          }
        } else {
          actuallyScheduled.set(postId, { state: 'loadingImagesFailed' });
          state.post.instagram = {
            state: 'scheduleDesired',
            scheduledAt: state.post.instagram.scheduledAt,
            notScheduledReason:
              'One or several images unavailable as of ' +
              new Date().toISOString(),
          };
        }
      }
    }

    tryLoadingImagesTimeout = setTimeout(tryLoadingImages, 10_000);
    tryPostingTimeout = setTimeout(() => {
      tryPosting();
    }, 10_000);
  };

  const tryPosting = async () => {
    console.log(new Date(), 'actuallyScheduled in tryPosting');
    logActuallyScheduled(actuallyScheduled);

    if (process.env.NODE_ENV === 'development') {
      console.log(new Date(), 'not actually posting in dev mode');
      return;
    }

    for (let [postId, state] of actuallyScheduled.entries()) {
      if (state.state === 'ready' && state.scheduledAt < new Date()) {
        console.log(new Date(), 'posting', postId);
        if (process.env.ARMED === 'true') {
          actuallyScheduled.set(postId, { state: 'posting' });
          await actuallyPost(worker, postId, actuallyScheduled, state);
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

    tryPostingTimeout = setTimeout(tryPosting, 10_000);
  };
}

runner();

function logActuallyScheduled(actuallyScheduled: ActuallyScheduled) {
  console.table(
    [...actuallyScheduled.entries()].map(([id, state]) =>
      state.state === 'posting' || state.state === 'loadingImagesFailed'
        ? { state: state.state }
        : {
            content: state.content?.split('\n')[0].slice(0, 20),
            state: state.state,
            scheduledAt: state.scheduledAt,
            id,
            imageFileIds: state.imageFileIds,
          }
    )
  );
}
