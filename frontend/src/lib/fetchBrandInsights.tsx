import { BrandInstagramInsights } from '../sharedDataModel';

export function fetchBrandInsights(
  instagramAccessToken: string,
  insights: BrandInstagramInsights
) {
  console.log('FETCHING INSIGHTS');

  fetch(
    `https://graph.facebook.com/v18.0/17841460119090729/insights?metric=impressions%2Creach%2Cprofile_views&period=day&since=${new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 25
    ).toISOString()}&until=${new Date().toISOString()}&access_token=` +
      instagramAccessToken
  )
    .then((response) => response.json())
    .then((data) => {
      console.log('DATA', data);

      const insightsPerDay: {
        [day: string]: {
          impressions?: number;
          reach?: number;
          profileViews?: number;
          accountsEngaged?: number;
        };
      } = {};

      for (const insightGroup of data.data) {
        const target =
          insightGroup.name === 'impressions'
            ? 'impressions'
            : insightGroup.name === 'reach'
              ? 'reach'
              : insightGroup.name === 'profile_views'
                ? 'profileViews'
                : insightGroup.name === 'accounts_engaged'
                  ? 'accountsEngaged'
                  : (() => {
                      throw new Error('Unknown insight group');
                    })();

        for (const value of insightGroup.values) {
          const day = value.end_time as string;

          if (!insightsPerDay[day]) {
            insightsPerDay[day] = {};
          }

          insightsPerDay[day][target] = value.value;
        }
      }

      console.log('insightsPerDay', insightsPerDay);

      for (const day of Object.keys(insightsPerDay)) {
        insights[day] = insightsPerDay[day];
      }
    });
}
