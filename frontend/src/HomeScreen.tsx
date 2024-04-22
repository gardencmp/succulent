import { Button } from '@/components/ui/button';
import { Input } from './components/ui/input';
import { Brand, ListOfPosts } from './sharedDataModel';
import { BrandView } from './components/BrandView';
import { Account, Group, ID } from 'jazz-tools';
import { useAccount } from './main';

export function HomeScreen() {
  const scheduleWorkerId = 'co_zjCnxyEB93sdMwGBHeF5xPY17H9' as ID<Account>;
  const { me } = useAccount();

  return (
    <main className="p-10 flex flex-col gap-5">
      <h1 className="text-2xl">My brands</h1>
      {/* {JSON.stringify(me.root)} */}
      <div className="grid grid-cols-4 gap-2">
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

            const scheduleWorker = await Account.load(scheduleWorkerId, {
              as: me,
            });
            if (!scheduleWorker) {
              throw new Error('scheduleWorker unavailable');
            }

            const brandGroup = new Group(undefined, {
              owner: me,
            });
            brandGroup.addMember(scheduleWorker, 'writer');

            const brand = new Brand(
              {
                name: brandName,
                posts: new ListOfPosts([], { owner: brandGroup }),
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
