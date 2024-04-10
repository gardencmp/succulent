import { Button } from '@/components/ui/button';
import { AccountRoot } from './dataModel';
import { useJazz } from 'jazz-react';
import { Profile, AccountID } from 'cojson';
import { Input } from './components/ui/input';
import { Brand, ListOfPosts } from './sharedDataModel';
import { BrandView } from './components/BrandView';

export function HomeScreen() {
  const scheduleWorkerId = 'co_zjCnxyEB93sdMwGBHeF5xPY17H9' as AccountID;
  const { me, localNode } = useJazz<Profile, AccountRoot>();

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

            const scheduleWorker = await localNode.load(scheduleWorkerId);
            if (!scheduleWorker || scheduleWorker === 'unavailable') {
              throw new Error('scheduleWorker unavailable');
            }

            const brandGroup = me
              .createGroup()
              .addMember(scheduleWorker, 'writer');

            const brand = brandGroup.createMap<Brand>({
              name: brandName,
              posts: brandGroup.createList<ListOfPosts>().id,
            });

            me.root?.brands.append(brand.id);
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
