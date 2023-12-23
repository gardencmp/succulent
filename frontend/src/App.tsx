import { Button } from "@/components/ui/button";
import { AccountRoot, Brand, ListOfPosts } from "./dataModel";
import { ResolvedCoMap, useJazz } from "jazz-react";
import { Profile, AccountID } from "cojson";
import { Input } from "./components/ui/input";
import FacebookLogin from "react-facebook-login";
import { Link, RouterProvider, createHashRouter } from "react-router-dom";
import { BrandInsightsScreen } from "./BrandInsightsScreen";
import { BrandScheduleScreen } from "./BrandScheduleScreen";
import { useState } from "react";

const router = createHashRouter([
    {
        path: "/",
        element: <HomeScreen />,
    },
    {
        path: "/brand/:brandId/insights",
        element: <BrandInsightsScreen />,
    },
    {
        path: "/brand/:brandId/schedule",
        element: <BrandScheduleScreen />,
    },
    {
        path: "/invite/*",
        element: <p>Accepting invite...</p>,
    },
]);

function App() {
    return <><div className="text-center p-2 tracking-wider">succulent</div><RouterProvider router={router} /></>;
}

const scheduleWorkerId = "co_z4RuEedFWkdzjGEsXg2aBR4UYL6" as AccountID;

function HomeScreen() {
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

                        const scheduleWorker = await localNode.load(
                            scheduleWorkerId
                        );
                        if (
                            !scheduleWorker ||
                            scheduleWorker === "unavailable"
                        ) {
                            throw new Error("scheduleWorker unavailable");
                        }

                        const brandGroup = me
                            .createGroup()
                            .addMember(scheduleWorker, "writer");

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
    "instagram_basic",
    "pages_show_list",
    "business_management",
    "pages_read_engagement",
    "pages_manage_metadata",
    "pages_read_user_content",
    "pages_manage_ads",
    "pages_manage_posts",
    "pages_manage_engagement",
    "read_insights",
    "instagram_manage_insights",
    "ads_management",
    "instagram_content_publish",
];

function BrandComponent({ brand }: { brand: ResolvedCoMap<Brand> }) {
    const { me } = useJazz<Profile, AccountRoot>();

    const [pagesToChoose, setPagesToChoose] = useState<
        { name: string; instagram_business_account: {id: string} }[]
    >([]);

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl mb-4">
                {brand.name}{" "}
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        me.root?.brands?.delete(
                            me.root.brands.findIndex((b) => b?.id === brand.id)
                        );
                    }}
                >
                    Delete brand
                </Button>
            </h1>
            {!brand.instagramAccessToken && (
                <div>
                    <FacebookLogin
                        appId="851322152980071"
                        autoLoad={true}
                        fields="name,email"
                        scope={scopes.join(",")}
                        callback={async (userInfo) => {
                            console.log("FB", userInfo);
                            // TODO: move this to backend!!!
                            const longLivedResult = await (
                                await fetch(
                                    `https://graph.facebook.com/v2.3/oauth/access_token?grant_type=fb_exchange_token&client_id=${"851322152980071"}&client_secret=${"4b98eab5cb91eb00ccea27ed2fef6a9d"}&fb_exchange_token=${
                                        (userInfo as any).accessToken
                                    }`
                                )
                            ).json();
                            console.log("RESULT", longLivedResult);
                            brand.set(
                                "instagramAccessToken",
                                longLivedResult.access_token
                            );
                            brand.set(
                                "instagramAccessTokenValidUntil",
                                Date.now() + longLivedResult.expires_in * 1000
                            );
                        }}
                    />
                </div>
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
                            key={page.id}
                            onClick={() => {
                                brand.set("instagramPage", {
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
            {brand.instagramPage && <div>Instagram page: {brand.instagramPage.name} <Button size="sm" className="text-xs" variant="ghost" onClick={
                () => {
                    brand.delete("instagramPage");
                }
            }>Reset</Button></div>}

            <div>
                IG Access Token{" "}
                {brand.instagramAccessToken &&
                    brand.instagramAccessTokenValidUntil &&
                    "(expires : " +
                        new Date(
                            brand.instagramAccessTokenValidUntil
                        ).toLocaleString() +
                        ")"}
                <Input
                    type="text"
                    value={brand.instagramAccessToken}
                    onChange={(event) => {
                        brand.set("instagramAccessToken", event.target.value);
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

export default App;
