import { CoMap, CoList, AccountMigration } from "cojson";
import { ListOfBrands, Post } from "../../shared/sharedDataModel";

export type AccountRoot = CoMap<{
    brands: ListOfBrands["id"];
}>;

export const accountMigration: AccountMigration = (account, profile) => {
    if (!account.get("root")) {
        account.set(
            "root",
            account.createMap<AccountRoot>({
                brands: account.createList<ListOfBrands>().id,
            }).id
        );
    }
};
