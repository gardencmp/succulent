import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Brand, BrandInstagramInsights } from './sharedDataModel';
import { InsightsChartView } from './insightsView/InsightsChartView';
import { cn } from './lib/utils';
import { HashtagInsightsScreen } from './HashtagInsightsScreen';
import { useCoState } from './main';
import { ID } from 'jazz-tools';

export function BrandInsightsScreen() {
  const brandId = useParams<{ brandId: ID<Brand> }>().brandId;
  const brand = useCoState(Brand, brandId);

  type viewTypes = 'posts' | 'hashtags' | 'profile';
  const viewTabs = ['posts', 'hashtags', 'profile'];
  const [activeTab, setActiveTab] = useState<viewTypes>('posts');

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
    <div className="flex flex-col gap-6 px-8 flex-shrink min-h-[100vh]">
      {/* <h1 className="text-l">{brand?.name} Insights</h1> */}
      {/* <Button
        onClick={() => {
          brand?.delete('instagramInsights');
        }}
      >
        Clear
      </Button> */}
      <ul className="flex-none tabs flex mb-3">
        {viewTabs.map((tab) => (
          <li
            key={tab}
            className={cn('cursor-pointer text-stone-400 pr-3', {
              'text-white font-semibold': activeTab === tab,
            })}
            onClick={() => setActiveTab(tab as viewTypes)}
          >
            {tab}
          </li>
        ))}
      </ul>
      {brand?.instagramInsights && activeTab === 'profile' && (
        <InsightsChartView insights={brand.instagramInsights} />
      )}
      {activeTab === 'hashtags' && <HashtagInsightsScreen />}
    </div>
  );
}
