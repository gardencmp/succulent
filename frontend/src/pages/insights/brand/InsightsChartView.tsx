import { BrandInstagramInsights } from '@/sharedDataModel';
import { ResponsiveLine } from '@nivo/line';

export function InsightsChartView({
  insights,
}: {
  insights: BrandInstagramInsights;
}) {
  console.log('insights', insights);
  const insightsData = [
    {
      id: 'Impressions',

      data: Object.entries(insights).map(([day, insight]) => ({
        x: day.split('T')[0],
        y: insight.impressions,
      })),
    },
    {
      id: 'Reach',
      data: Object.entries(insights).map(([day, insight]) => ({
        x: day.split('T')[0],
        y: insight.reach,
      })),
    },
    {
      id: 'Profile views',
      data: Object.entries(insights).map(([day, insight]) => ({
        x: day.split('T')[0],
        y: insight.profileViews,
      })),
    },
    // {
    //     id: "Accounts engaged",
    //     data: Object.entries(insights).map(([day, insight]) => ({
    //         x: day.split("T")[0],
    //         y: insight.accountsEngaged,
    //     })),
    // },
  ];

  console.log('insightsData', insightsData);

  return (
    <div className="h-[30rem]">
      <ResponsiveLine
        data={insightsData}
        axisBottom={{
          format: '%b %d',
          legend: 'time scale',
          legendOffset: -12,
          tickValues: 'every 2 days',
        }}
        enableSlices="x"
        useMesh={true}
        curve="monotoneX"
        xFormat="time:%Y-%m-%d"
        xScale={{
          format: '%Y-%m-%d',
          precision: 'day',
          type: 'time',
          useUTC: false,
        }}
        yScale={{
          type: 'linear',
        }}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
}
