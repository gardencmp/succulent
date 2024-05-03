import { Account, CoMap, Profile, co } from 'jazz-tools';
import { ListOfBrands } from './sharedDataModel';

export class AccountRoot extends CoMap {
  brands = co.ref(ListOfBrands);
}

export class SucculentAccount extends Account {
  profile = co.ref(Profile);
  root = co.ref(AccountRoot);

  migrate(creationProps?: { name: string }) {
    super.migrate(creationProps);
    if (!this._refs.root) {
      this.root = AccountRoot.create(
        {
          brands: ListOfBrands.create([], { owner: this }),
        },
        { owner: this }
      );
    }
  }
}
