import { Button } from '@/components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Brand,
  ListOfLocations,
  ListOfPosts,
  UserTagList,
} from '../../sharedDataModel';
import { BrandView } from './BrandView';
import { Account, Group, ID } from 'jazz-tools';
import { useAccount } from '../../main';

export function HomePage() {
  const scheduleWorkerId = 'co_zjCnxyEB93sdMwGBHeF5xPY17H9' as ID<Account>;
  const { me } = useAccount();

  return (
    <main className="p-10 flex flex-col gap-5">
      <h1 className="text-2xl">My brands</h1>
      {/* {JSON.stringify(me.root)} */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-2">
        {me.root?.brands?.map(
          (brand) =>
            brand && (
              <div className="border rounded p-4">
                <BrandView key={brand.id} brand={brand} />
              </div>
            )
        )}
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!me.root?.brands) return;
            const el = event.currentTarget;
            const brandName = el.brand.value;

            const scheduleWorker = await Account.load(scheduleWorkerId, me, {});
            if (!scheduleWorker) {
              throw new Error('scheduleWorker unavailable');
            }

            const brandGroup = Group.create({
              owner: me,
            });
            brandGroup.addMember(scheduleWorker, 'writer');

            const brand = Brand.create(
              {
                name: brandName,
                posts: ListOfPosts.create([], { owner: brandGroup }),
                usedLocations: ListOfLocations.create([], {
                  owner: brandGroup,
                }),
                usedUserTags: UserTagList.create([], { owner: brandGroup }),
              },
              { owner: brandGroup }
            );

            me.root?.brands.push(brand);
          }}
          className="border rounded p-4 flex flex-col gap-2"
        >
          <Input type="text" name="brand" placeholder="Brand name" />
          <Button asChild>
            <input type="submit" value="Add brand" />
          </Button>
        </form>
      </div>
    </main>
  );
}
