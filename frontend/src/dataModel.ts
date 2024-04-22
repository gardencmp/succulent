import { Account, CoMap, Profile, co } from 'jazz-tools';
import { ListOfBrands } from './sharedDataModel';

export class AccountRoot extends CoMap<AccountRoot> {
  brands = co.ref(ListOfBrands);
}

export class SucculentAccount extends Account<SucculentAccount> {
  profile = co.ref(Profile);
  root = co.ref(AccountRoot);

  migrate = () => {
    if (!this._refs.root) {
      this.root = new AccountRoot(
        {
          brands: new ListOfBrands([], { owner: this }),
        },
        { owner: this }
      );
    }
  };
}
