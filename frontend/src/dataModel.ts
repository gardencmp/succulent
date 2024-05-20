import { Account, CoMap, Profile, co } from 'jazz-tools';
import { ListOfBrands } from './sharedDataModel';
import { insightTypes } from './pages/settings/PreferencesPage';

export class AccountRoot extends CoMap {
  brands = co.ref(ListOfBrands);
  settings = co.ref(Settings);
}

export class Settings extends CoMap {
  perBrand = co.ref(SettingsPerBrand);
}

export class PersonalBrandSettings extends CoMap {
  postInsightsOrder: (typeof insightTypes)[number][] = [];
}

export class SettingsPerBrand extends CoMap.Record(
  co.ref(PersonalBrandSettings)
) {}

export class SucculentAccount extends Account {
  profile = co.ref(Profile);
  root = co.ref(AccountRoot);

  async migrate(creationProps?: { name: string }) {
    super.migrate(creationProps);
    if (!this._refs.root) {
      this.root = AccountRoot.create(
        {
          brands: ListOfBrands.create([], { owner: this }),
        },
        { owner: this }
      );
    }
    const root = (await this._refs.root!.load())!;
    if (!root._refs.settings) {
      root.settings = Settings.create(
        {
          perBrand: SettingsPerBrand.create(
            {
              // TODO
            },
            { owner: this }
          ),
        },
        { owner: this }
      );
    }
  }
}
