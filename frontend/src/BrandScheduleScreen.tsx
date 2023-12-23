import { AccountRoot, Brand } from "./dataModel";
import { Resolved, useAutoSub, useJazz } from "jazz-react";
import { createBinaryStreamFromBlob } from "jazz-browser";
import { CoID, Profile, CoStream } from "cojson";
import { useParams } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Image, ListOfImages, Post } from "../../shared/sharedDataModel";
import { Textarea } from "./components/ui/textarea";
import { Input } from "./components/ui/input";
import { BrowserImage, createImage } from "jazz-browser-media-images";
import { Calendar } from "./components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./components/ui/popover";
import { useCallback, useRef } from "react";

const scheduledPostsStreamId = "co_zGzPPekq1KTv7szgJ8VFcFUe8ht" as CoID<
    CoStream<Post["id"]>
>;

export function BrandScheduleScreen() {
    const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;

    const brand = useAutoSub(brandId);

    return (
        <div className="flex flex-col gap-8 p-8">
            <h1 className="text-3xl ">{brand?.name} Schedule</h1>
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
}

function PostComponent({
    post,
    onDelete,
}: {
    post: Resolved<Post>;
    onDelete?: () => void;
}) {
    const { me, localNode } = useJazz<Profile, AccountRoot>();
    const schedule = useCallback(
        async (scheduleAt: Date) => {
            post.set("instagram", {
                state: "scheduleDesired",
                scheduledAt: scheduleAt.toISOString(),
            });

            const scheduledPostsStream = await localNode.load(
                scheduledPostsStreamId
            );

            if (scheduledPostsStream === "unavailable") {
                throw new Error("scheduledPostsStream unavailable");
            }

            if (
                ![...scheduledPostsStream.itemsBy(me.id)].some(
                    (entry) => entry.value === post.id
                )
            ) {
                scheduledPostsStream.push(post.id);
            }
        },
        [post]
    );

    return (
        <div className="border rounded p-4 flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-scroll">
                {post.images?.map(
                    (image) =>
                        image &&
                        image.imageFile && (
                            <img
                                key={image.id}
                                className="w-40 h-40 object-cover shrink-0"
                                src={
                                    image.imageFile.as(BrowserImage)
                                        ?.highestResSrcOrPlaceholder
                                }
                            />
                        )
                )}
                <Input
                    type="file"
                    className="w-40 h-40 shrink-0 border relative after:content-['+'] after:absolute after:inset-0 after:bg-white dark:after:bg-black after:cursor-pointer after:z-10 after:text-5xl after:flex after:items-center after:justify-center"
                    onChange={(event) => {
                        if (!post) return;

                        const files = [...(event.target.files || [])];

                        Promise.all(
                            files.map((file) =>
                                createImage(file, post.meta.group).then(
                                    (image) => {
                                        post.images?.append(
                                            post.meta.group.createMap<Image>({
                                                imageFile: image.id,
                                            }).id
                                        );
                                    }
                                )
                            )
                        );
                    }}
                />
            </div>
            <Textarea
                className="text-lg min-h-[5rem]"
                value={post?.content}
                onChange={(event) => {
                    if (!post) return;
                    post.set("content", event.target.value);
                }}
                placeholder="Post content"
            />
            <div className="flex gap-2 items-center">
                <Input
                    type="datetime-local"
                    value={
                        post.instagram.state === "scheduleDesired" ||
                        post.instagram.state === "scheduled"
                            ? toDatetimeLocal(
                                  new Date(post.instagram.scheduledAt)
                              )
                            : undefined
                    }
                    onChange={(event) => {
                        console.log(new Date(event.target.value));
                        schedule(new Date(event.target.value));
                    }}
                    min={toDatetimeLocal(new Date())}
                    className="dark:[color-scheme:dark] max-w-[13rem]"
                />
                <div className="whitespace-nowrap mr-auto">
                    {post.instagram.state === "notScheduled"
                        ? "Not yet scheduled"
                        : post.instagram.state === "scheduleDesired"
                        ? "Schedule desired"
                        : post.instagram.state === "scheduled"
                        ? "Scheduled"
                        : post.instagram.state === "posted"
                        ? "Posted"
                        : "loading"}
                </div>
                {(post.instagram.state === "scheduleDesired" ||
                    post.instagram.state === "scheduled") && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            post.set("instagram", {
                                state: "notScheduled",
                            });
                        }}
                    >
                        Unschedule
                    </Button>
                )}
                <Button variant="destructive" onClick={onDelete}>
                    Delete Post
                </Button>
            </div>
            <div className="text-xs">Succulent post id: {post.id}</div>
        </div>
    );
}

function toDatetimeLocal(d: Date) {
    const copy = new Date(d);
    copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
    return copy.toISOString().slice(0, 16);
}
