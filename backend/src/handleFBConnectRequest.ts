import { Account, ID, Me } from 'jazz-tools';
import { Brand } from '../sharedDataModel';

export async function handleFBConnectRequest(req: Request, as: Account & Me) {
  const code = new URL(req.url).searchParams.get('code');

  if (!code) return new Response('no code');

  const shortLivedResult = await (
    await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${
        process.env.FB_CLIENT_ID
      }&redirect_uri=${encodeURIComponent(
        (process.env.SUCCULENT_BACKEND_ADDR || 'http://localhost:3331') +
          '/connectFB'
      )}&client_secret=${process.env.FB_CLIENT_SECRET}&code=${code}`
    )
  ).json();

  console.log(new Date(), 'shortLivedResult', shortLivedResult);

  const longLivedResult = await (
    await fetch(
      `https://graph.facebook.com/v2.3/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FB_CLIENT_ID}&client_secret=${process.env.FB_CLIENT_SECRET}&fb_exchange_token=${shortLivedResult.access_token}`
    )
  ).json();

  console.log(new Date(), 'longLivedResult', longLivedResult);

  const brandId = new URL(req.url).searchParams.get('state');

  if (!brandId) return new Response('no brandId');

  const brand = await Brand.load(brandId as ID<Brand>, { as });

  if (!brand) return new Response('unavailable');

  brand.instagramAccessToken = longLivedResult.access_token;
  brand.instagramAccessTokenValidUntil =
    Date.now() + longLivedResult.expires_in * 1000;

  console.log(new Date(), brand.toJSON());

  // redirect to frontend
  return Response.redirect(
    process.env.SUCCULENT_FRONTEND_ADDR || 'http://localhost:3889/'
  );
}
