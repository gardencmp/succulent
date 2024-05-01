import { SchedulerAccount } from './workerAccount';

export function logAccountState(account: SchedulerAccount) {
  console.log(new Date(), 'scheduledPosts', account.root?.scheduledPosts?.id);

  console.table(
    Object.entries(account.root?.scheduledPosts?.perSession || {}).flatMap(
      (entry) =>
        [...entry[1].all].map((post) => ({
          session: entry[0].split('_session_')[1],
          id: post.value?.id,
          state: post.value?.instagram?.state,
          scheduledAt:
            post.value &&
            'scheduledAt' in post.value.instagram &&
            post.value?.instagram?.scheduledAt,
          content: post.value?.content?.split('\n')[0].slice(0, 20),
          imageFileIds: post.value?.images?.map(
            (image) => image?.imageFile?.id
          ),
        }))
    )
  );
}
