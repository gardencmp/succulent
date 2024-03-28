import { Account, Profile } from 'cojson';
import { Resolved } from 'jazz-autosub';
import { WorkerAccountRoot } from '.';

export function logAccountState(
  account: Resolved<Account<Profile, WorkerAccountRoot>>
) {
  console.log(
    new Date(),
    'scheduledPosts',
    account.root?.scheduledPosts?.id,

    '\n\t' +
      account.root?.scheduledPosts?.perSession
        .flatMap((entry) =>
          entry[1].all.map((post) =>
            JSON.stringify({
              id: post.value?.id,
              state: post.value?.instagram?.state,
              scheduledAt:
                post.value &&
                'scheduledAt' in post.value.instagram &&
                post.value?.instagram?.scheduledAt,
              content: post.value?.content?.slice(0, 50),
              imageFileIds: post.value?.images?.map(
                (image) => image?.imageFile?.id
              ),
            })
          )
        )
        .join('\n\t')
  );
}
