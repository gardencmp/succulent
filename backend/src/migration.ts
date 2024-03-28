import { ControlledAccount, Profile } from 'cojson';
import { WorkerAccountRoot, ScheduledPosts } from '.';

export const migration = async (
  account: ControlledAccount<Profile, WorkerAccountRoot>
) => {
  console.log(new Date(), account.toJSON());
  if (!account.get('root')) {
    const scheduledPostsGroup = account.createGroup();
    scheduledPostsGroup.addMember('everyone', 'writer');

    const scheduledPosts = scheduledPostsGroup.createStream<ScheduledPosts>();

    console.log(new Date(), 'scheduledPosts in migration', scheduledPosts.id);

    const after = account.set(
      'root',
      account.createMap<WorkerAccountRoot>({
        scheduledPosts: scheduledPosts.id,
      }).id
    );

    console.log(new Date(), after.toJSON());
  }
};
