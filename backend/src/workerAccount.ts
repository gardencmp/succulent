import { Group, co, CoMap, CoStream, Account, Profile } from 'jazz-tools';
import { Post } from '../sharedDataModel';

export class SchedulerAccountRoot extends CoMap<SchedulerAccountRoot> {
  scheduledPosts = co.ref(ScheduledPosts);
}

export class ScheduledPosts extends CoStream.Of(co.ref(Post)) {}

// export const migration = async (
//   account: ControlledAccount<Profile, WorkerAccountRoot>
// ) => {
//   console.log(new Date(), account.toJSON());
//   if (!account.get('root')) {
//     const scheduledPostsGroup = account.createGroup();
//     scheduledPostsGroup.addMember('everyone', 'writer');

//     const scheduledPosts = scheduledPostsGroup.createStream<ScheduledPosts>();

//     console.log(new Date(), 'scheduledPosts in migration', scheduledPosts.id);

//     const after = account.set(
//       'root',
//       account.createMap<WorkerAccountRoot>({
//         scheduledPosts: scheduledPosts.id,
//       }).id
//     );

//     console.log(new Date(), after.toJSON());
//   }
// };

export class SchedulerAccount extends Account<SchedulerAccount> {
  profile = co.ref(Profile);
  root = co.ref(SchedulerAccountRoot);

  migrate = () => {
    if (!this._refs.root) {
      const scheduledPostsGroup = new Group({ owner: this });
      scheduledPostsGroup.addMember('everyone', 'writer');

      const scheduledPosts = new ScheduledPosts([], {
        owner: scheduledPostsGroup,
      });

      this.root = new SchedulerAccountRoot(
        {
          scheduledPosts: scheduledPosts,
        },
        { owner: this }
      );
    }
  };
}
