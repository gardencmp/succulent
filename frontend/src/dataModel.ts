import { CoMap, AccountMigration } from 'cojson';
import { ListOfBrands } from './sharedDataModel';

export type AccountRoot = CoMap<{
  brands: ListOfBrands['id'];
}>;

export const accountMigration: AccountMigration = (account) => {
  if (!account.get('root')) {
    account.set(
      'root',
      account.createMap<AccountRoot>({
        brands: account.createList<ListOfBrands>().id,
      }).id
    );
  }
};
