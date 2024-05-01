import { Group, co, CoMap, CoStream, Account, Profile } from 'jazz-tools';
import { Brand, ListOfBrands, Post } from '../sharedDataModel';

export class SchedulerAccountRoot extends CoMap<SchedulerAccountRoot> {
  brands = co.ref(ListOfBrands);
}

export class ScheduledPosts extends CoStream.Of(co.ref(Post)) {}

export class SchedulerAccount extends Account<SchedulerAccount> {
  profile = co.ref(Profile);
  root = co.ref(SchedulerAccountRoot);

  migrate = () => {
    if (!this._refs.root) {
      this.root = new SchedulerAccountRoot(
        {
          brands: new ListOfBrands([], { owner: this }),
        },
        { owner: this }
      );
    }
  };
}
