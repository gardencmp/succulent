import { Button } from "@/components/ui/button";
import { ResolvedCoMap, useAutoSub } from "jazz-react";
import { CoID } from "cojson";
import { useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useParams } from "react-router-dom";
import { Brand, InstagramInsights } from "./sharedDataModel";

export function BrandInsightsScreen() {
    const brandId = useParams<{ brandId: CoID<Brand>; }>().brandId;

    const brand = useAutoSub(brandId);

    useEffect(() => {
        if (!brand) return;

        if (!brand.meta.coValue.get("instagramInsights")) {
            const insights = brand.meta.group.createMap<InstagramInsights>();
            brand.set("instagramInsights", insights.id);

            console.log("FETCHING INSIGHTS");

            fetch(
                `https://graph.facebook.com/v18.0/17841460119090729/insights?metric=impressions%2Creach%2Cprofile_views&period=day&since=${new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 25
                ).toISOString()}&until=${new Date().toISOString()}&access_token=` +
                brand.instagramAccessToken
            )
                .then((response) => response.json())
                .then((data) => {
                    console.log("DATA", data);

                    const insightsPerDay: {
                        [day: string]: {
                            impressions?: number;
                            reach?: number;
                            profileViews?: number;
                            accountsEngaged?: number;
                        };
                    } = {};

                    for (const insightGroup of data.data) {
                        const target = insightGroup.name === "impressions"
                            ? "impressions"
                            : insightGroup.name === "reach"
                                ? "reach"
                                : insightGroup.name === "profile_views"
                                    ? "profileViews"
                                    : insightGroup.name === "accounts_engaged"
                                        ? "accountsEngaged"
                                        : (() => {
                                            throw new Error("Unknown insight group");
                                        })();

                        for (const value of insightGroup.values) {
                            const day = value.end_time as string;

                            if (!insightsPerDay[day]) {
                                insightsPerDay[day] = {};
                            }

                            insightsPerDay[day][target] = value.value;
                        }
                    }

                    console.log("insightsPerDay", insightsPerDay);

                    for (const day of Object.keys(insightsPerDay)) {
                        insights.set(day, insightsPerDay[day]);
                    }
                });
        }
    }, [brand?.instagramAccessToken, brand?.instagramInsights]);

    return (
        <>
            <h1 className="text-3xl ">{brand?.name} Insights</h1>
            <Button
                onClick={() => {
                    brand?.delete("instagramInsights");
                }}
            >
                Clear
            </Button>
            {/* <pre>{JSON.stringify(brand?.instagramInsights, undefined, 2)}</pre> */}
            {brand?.instagramInsights && (
                <InsightsChart insights={brand.instagramInsights} />
            )}
        </>
    );
}
function InsightsChart({
    insights,
}: {
    insights: ResolvedCoMap<InstagramInsights>;
}) {
    console.log("insights", insights);
    const insightsData = [
        {
            id: "Impressions",

            data: Object.entries(insights).map(([day, insight]) => ({
                x: day.split("T")[0],
                y: insight.impressions,
            })),
        },
        {
            id: "Reach",
            data: Object.entries(insights).map(([day, insight]) => ({
                x: day.split("T")[0],
                y: insight.reach,
            })),
        },
        {
            id: "Profile views",
            data: Object.entries(insights).map(([day, insight]) => ({
                x: day.split("T")[0],
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

    console.log("insightsData", insightsData);

    return (
        <div className="h-[30rem]">
            <ResponsiveLine
                data={insightsData}
                axisBottom={{
                    format: "%b %d",
                    legend: "time scale",
                    legendOffset: -12,
                    tickValues: "every 2 days",
                }}
                enableSlices="x"
                useMesh={true}
                curve="monotoneX"
                xFormat="time:%Y-%m-%d"
                xScale={{
                    format: "%Y-%m-%d",
                    precision: "day",
                    type: "time",
                    useUTC: false,
                }}
                yScale={{
                    type: "linear",
                }}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                legends={[
                    {
                        anchor: "bottom-right",
                        direction: "column",
                        justify: false,
                        translateX: 100,
                        translateY: 0,
                        itemsSpacing: 0,
                        itemDirection: "left-to-right",
                        itemWidth: 80,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: "circle",
                        symbolBorderColor: "rgba(0, 0, 0, .5)",
                        effects: [
                            {
                                on: "hover",
                                style: {
                                    itemBackground: "rgba(0, 0, 0, .03)",
                                    itemOpacity: 1,
                                },
                            },
                        ],
                    },
                ]} />
        </div>
    );
}
