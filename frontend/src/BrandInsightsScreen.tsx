import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Brand, BrandInstagramInsights } from './sharedDataModel';
import { InsightsChartView } from './insightsView/InsightsChartView';
import { HashtagInsightsScreen } from './HashtagInsightsScreen';
import { useCoState } from './main';
import { ID } from 'jazz-tools';
import { LayoutWithNav } from './Nav';

export function BrandInsightsScreen() {
  const brandId = useParams<{ brandId: ID<Brand> }>().brandId;
  const path = useLocation().pathname;
  const brand = useCoState(Brand, brandId);

  useEffect(() => {
    if (!brand) return;

    if (!brand._refs.instagramInsights) {
      const insights = BrandInstagramInsights.create(
        {},
        { owner: brand._owner }
      );
      brand.instagramInsights = insights;

      console.log('FETCHING INSIGHTS');

      fetch(
        `https://graph.facebook.com/v18.0/17841460119090729/insights?metric=impressions%2Creach%2Cprofile_views&period=day&since=${new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 25
        ).toISOString()}&until=${new Date().toISOString()}&access_token=` +
          brand.instagramAccessToken
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
  }, [brand?.instagramAccessToken, brand?.instagramInsights]);

  return (
    <LayoutWithNav>
      {/* <Button
        onClick={() => {
          brand?.delete('instagramInsights');
        }}
      >
        Clear
      </Button> */}
      {path.endsWith('brand') &&
        (brand?.instagramInsights ? (
          <InsightsChartView insights={brand.instagramInsights} />
        ) : (
          <div>Loading...</div>
        ))}
      {path.endsWith('hashtags') && <HashtagInsightsScreen />}
    </LayoutWithNav>
  );
}
