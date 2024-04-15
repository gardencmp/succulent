import { Co, Profile } from 'jazz-tools';
import { Brand, ListOfBrands } from './sharedDataModel';
import { CoList } from 'jazz-tools';

export class AccountRoot extends Co.Map<AccountRoot> {
  declare brands: CoList<Brand | null> | null;

  static {
    this.define({
      brands: { ref: () => Co.List<Brand | null>({ ref: () => Brand }) },
    });
  }
}

export class SucculentAccount extends Co.Account<SucculentAccount> {
  declare profile: Profile;
  declare root: AccountRoot;

  static {
    this.define({
      profile: { ref: () => Profile },
      root: { ref: () => AccountRoot },
    });
  }

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
