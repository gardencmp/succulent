import { Brand } from '@/sharedDataModel';
import { InviteButton } from '../../components/InviteButton';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { useAccount } from '@/main';

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

export function BrandView({ brand }: { brand: Brand }) {
  const { me } = useAccount();

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
              const idx = me.root?.brands?.findIndex((b) => b?.id === brand.id);
              typeof idx === 'number' &&
                idx !== -1 &&
                me.root?.brands?.splice(idx, 1);
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
                brand.instagramPage = {
                  id: page.instagram_business_account.id,
                  name: page.name,
                };
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
              brand.instagramPage = undefined;
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
            brand.instagramAccessToken = event.target.value;
          }}
        />
      </div>
      <Button asChild>
        <Link to={`/brand/${brand.id}/insights`}>Insights</Link>
      </Button>
      <Button asChild>
        <Link to={`/brand/${brand.id}/posting/feed`}>Posting</Link>
      </Button>
    </div>
  );
}
