import { useAutoSub } from "jazz-react";
import { CoID } from "cojson";
import { useParams } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Brand, ListOfImages, Post } from "./sharedDataModel";
import { PostComponent } from "./components/Post";

export function BrandScheduleScreen() {
    const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;

    const brand = useAutoSub(brandId);

    return (
        <div className="flex flex-col gap-8 p-8">
            <h1 className="text-3xl ">{brand?.name} Schedule</h1>
            <ul className="tabs flex">
              <li className="selected text-bold">Feed</li>
              <li>Calender</li>
            </ul>
            <Button
                variant="outline"
                className="h-20"
                onClick={() => {
                    if (!brand) return;
                    const draftPost = brand.meta.group.createMap<Post>({
                        instagram: {
                            state: "notScheduled",
                        },
                        images: brand.meta.group.createList<ListOfImages>().id,
                        inBrand: brand.id,
                    });
                    brand.posts?.append(draftPost.id);
                }}
            >
                + Add draft post
            </Button>
            {brand?.posts?.map(
                (post) =>
                    post && (
                        <PostComponent
                            key={post.id}
                            post={post}
                            onDelete={() => {
                                post.set("instagram", {
                                    state: "notScheduled",
                                });
                                brand.posts?.delete(
                                    brand.posts.findIndex(
                                        (p) => p?.id === post.id
                                    )
                                );
                            }}
                        />
                    )
            )}
        </div>
    );
};
