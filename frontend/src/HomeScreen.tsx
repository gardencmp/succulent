import { Button } from '@/components/ui/button';
import { AccountRoot } from './dataModel';
import { ResolvedCoMap, useJazz } from 'jazz-react';
import { Profile, AccountID } from 'cojson';
import { Input } from './components/ui/input';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Brand, ListOfPosts } from './sharedDataModel';
import { InviteButton } from './components/InviteButton';

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
                <BrandComponent key={brand.id} brand={brand} />
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

const scopes = [
  'instagram_basic',
  'pages_show_list',
  'business_management',
  'pages_read_engagement',
  'pages_manage_metadata',
  'pages_read_user_content',
  'pages_manage_ads',
  'pages_manage_posts',
  'pages_manage_engagement',
  'read_insights',
  'instagram_manage_insights',
  'ads_management',
  'instagram_content_publish',
];

function BrandComponent({ brand }: { brand: ResolvedCoMap<Brand> }) {
  const { me } = useJazz<Profile, AccountRoot>();

  const [pagesToChoose, setPagesToChoose] = useState<
    { name: string; instagram_business_account: { id: string } }[]
  >([]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl mb-4">{brand.name} </h1>
      <div className="flex justify-end gap-2">
        <InviteButton value={brand} />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm('Really delete ' + brand.name + '?')) {
              me.root?.brands?.delete(
                me.root.brands.findIndex((b) => b?.id === brand.id)
              );
            }
          }}
        >
          Delete brand
        </Button>
      </div>
      {!brand.instagramAccessToken && (
        <Button
          onClick={() => {
            window.location =
              `https://www.facebook.com/v18.0/dialog/oauth?client_id=${'851322152980071'}&redirect_uri=${encodeURIComponent(
                (import.meta.env.VITE_SUCCULENT_BACKEND_ADDR ||
                  'http://localhost:3331') + '/connectFB'
              )}&state=${brand.id}&scope=${encodeURIComponent(
                scopes.join(',')
              )}&response_type=code` as string & Location;
          }}
        >
          Connect to Instagram/Facebook
        </Button>
      )}
      {brand.instagramAccessToken &&
        !brand.instagramPage &&
        pagesToChoose.length === 0 && (
          <Button
            onClick={async () => {
              const pages = await (
                await fetch(
                  `https://graph.facebook.com/v11.0/me/accounts?fields=instagram_business_account,name&access_token=${brand.instagramAccessToken}`
                )
              ).json();
              setPagesToChoose(pages.data);
            }}
          >
            Choose Instagram Page ID
          </Button>
        )}
      {pagesToChoose.length > 0 && (
        <div>
          Choose an Instagram page:
          {pagesToChoose.map((page) => (
            <Button
              key={page.instagram_business_account.id}
              onClick={() => {
                brand.set('instagramPage', {
                  id: page.instagram_business_account.id,
                  name: page.name,
                });
                setPagesToChoose([]);
              }}
            >
              {page.name} ({page.instagram_business_account.id})
            </Button>
          ))}
        </div>
      )}
      {brand.instagramPage && (
        <div>
          Instagram page: {brand.instagramPage.name}{' '}
          <Button
            size="sm"
            className="text-xs"
            variant="ghost"
            onClick={() => {
              brand.delete('instagramPage');
            }}
          >
            Reset
          </Button>
        </div>
      )}

      <div>
        IG Access Token{' '}
        {brand.instagramAccessToken &&
          brand.instagramAccessTokenValidUntil &&
          '(expires : ' +
            new Date(brand.instagramAccessTokenValidUntil).toLocaleString() +
            ')'}
        <Input
          type="text"
          value={brand.instagramAccessToken}
          onChange={(event) => {
            brand.set('instagramAccessToken', event.target.value);
          }}
        />
      </div>
      <Button asChild>
        <Link to={`/brand/${brand.id}/insights`}>Insights</Link>
      </Button>
      <Button asChild>
        <Link to={`/brand/${brand.id}/schedule`}>Schedule</Link>
      </Button>
    </div>
  );
}
