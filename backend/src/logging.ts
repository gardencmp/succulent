import { ActuallyScheduled } from '.';
import { SchedulerAccountRoot } from './workerAccount';

export function logAccountState(root: SchedulerAccountRoot | null) {
  // return;
  console.log(new Date(), 'scheduledPosts');

  console.table(
    root?.brands?.flatMap(
      (brand) =>
        brand?.posts
          ?.toSorted((a, b) => {
            if (!a) return 1;
            if (!b) return -1;
            // sort by scheduledAt/postedAt
            const dateA = new Date(
              a.instagram?.state === 'posted'
                ? a.instagram?.postedAt
                : (a.instagram &&
                    'scheduledAt' in a.instagram &&
                    a.instagram?.scheduledAt) ||
                  new Date()
            );
            const dateB = new Date(
              b.instagram?.state === 'posted'
                ? b.instagram?.postedAt
                : (b.instagram &&
                    'scheduledAt' in b.instagram &&
                    b.instagram?.scheduledAt) ||
                  new Date()
            );
            return dateA > dateB ? -1 : 1;
          })
          .map((post) => ({
            brand: brand.name,
            content: post?.content?.split('\n')[0].slice(0, 20),
            state: post?.instagram?.state,
            ['scheduledAt/postedAt']:
              post?.instagram &&
              (('scheduledAt' in post.instagram &&
                post.instagram.scheduledAt) ||
                ('postedAt' in post.instagram && post.instagram.postedAt)),
            imgs: post?.images?.length,
            id: post?.id,
          }))
    )
  );
}

export function logActuallyScheduled(actuallyScheduled: ActuallyScheduled) {
  // return;
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
