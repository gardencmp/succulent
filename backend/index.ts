import {
    LocalNode,
    cojsonReady,
    ControlledAccount,
    AccountID,
    CoMap,
    CoStream,
    Account,
    Profile,
    BinaryCoStream,
    CoID,
    Media,
    BinaryStreamInfo,
} from "cojson";

import { createOrResumeWorker, autoSub } from "jazz-nodejs";
import { autoSubResolution, Resolved } from "jazz-autosub";

import { Image, Post } from "./sharedDataModel";

type WorkerAccountRoot = CoMap<{
    scheduledPosts: ScheduledPosts["id"];
}>;

type ScheduledPosts = CoStream<Post["id"]>;

async function runner() {
    const { localNode: node, worker } = await createOrResumeWorker({
        workerName: "SucculentScheduler",
        migration: async (account, profile) => {
            console.log(account.toJSON());
            if (!account.get("root")) {
                const scheduledPostsGroup = account.createGroup();
                scheduledPostsGroup.addMember("everyone", "writer");

                const scheduledPosts =
                    scheduledPostsGroup.createStream<ScheduledPosts>();

                console.log("scheduledPosts", scheduledPosts.id);
            }
        },
    });

    const actuallyScheduled = new Map<Post["id"], Date>();

    autoSub<Account<Profile, WorkerAccountRoot>>("me", node, (account) => {
        if (account?.root?.scheduledPosts) {
            console.log(
                "scheduledPosts",
                account.root.scheduledPosts.perSession.map((entry) =>
                    entry[1].all.map((post) => post.value?.content)
                )
            );

            for (let perSession of account.root.scheduledPosts.perSession) {
                for (let post of perSession[1].all) {
                    if (!post?.value) continue;
                    if (post.value.instagram.state === "scheduleDesired") {
                        actuallyScheduled.set(
                            post.value.id,
                            new Date(post.value.instagram.scheduledAt)
                        );
                        post.value.set("instagram", {
                            state: "scheduled",
                            scheduledAt: post.value.instagram.scheduledAt,
                        });
                    } else if (post.value.instagram.state === "scheduled") {
                        if (!actuallyScheduled.has(post.value.id)) {
                            actuallyScheduled.set(
                                post.value.id,
                                new Date(post.value.instagram.scheduledAt)
                            );
                            console.log("re-adding post", post.value.id);
                        }
                    } else if (post.value.instagram.state !== "posted") {
                        if (actuallyScheduled.has(post.value.id)) {
                            console.log("removing post", post.value.id);
                            actuallyScheduled.delete(post.value.id);
                        }
                    }
                }
            }
        }
    });

    Bun.serve({
        async fetch(req) {
            console.log(req.url);
            const imageFileId = req.url.split("/image/")[1];
            console.log(imageFileId);

            const image = await node.load(
                imageFileId as CoID<Media.ImageDefinition>
            );
            if (image === "unavailable") return new Response("unavailable!");
            const originalRes = image.get("originalSize");
            if (!originalRes) return new Response("no original res");
            const resName =
                `${originalRes[0]}x${originalRes[1]}` as `${number}x${number}`;
            const resId = image.get(resName);
            if (!resId) return new Response("no resId");
            const res = await node.load(resId);
            if (res === "unavailable") return new Response("unavailable!");

            const streamInfo = await new Promise<
                BinaryStreamInfo & { chunks: Uint8Array[] }
            >((resolve) => {
                const unsub = res.subscribe(async (stream) => {
                    const streamInfo = await stream.getBinaryChunks();
                    if (streamInfo) {
                        resolve(streamInfo);
                        unsub();
                    }
                });
            });

            return new Response(streamInfo.chunks, {
                headers: {
                    "Content-Type": streamInfo.mimeType,
                },
            });
        },
        port: 3331,
    });

    const tryPosting = async () => {
        console.log("actuallyScheduled", actuallyScheduled);

        for (let [postId, scheduledAt] of actuallyScheduled.entries()) {
            if (scheduledAt < new Date()) {
                console.log("posting", postId);
                actuallyScheduled.delete(postId);

                try {
                    const post = await node.load(postId);
                    if (post === "unavailable")
                        throw new Error("post unavailable");

                    try {
                        if (!post.get("inBrand")) throw new Error("no brand");

                        const brand = await node.load(post.get("inBrand")!);
                        if (brand === "unavailable")
                            throw new Error("brand unavailable");

                        const imagesListId = post.get("images");
                        if (!imagesListId) throw new Error("no images");
                        const imagesList = await node.load(imagesListId);

                        if (imagesList === "unavailable")
                            throw new Error("images unavailable");
                        const maybeImages = await Promise.all(
                            imagesList
                                .asArray()
                                .map((imageId) => node.load(imageId))
                        );

                        if (
                            maybeImages.some((image) => image === "unavailable")
                        )
                            throw new Error("image unavailable");

                        const images = maybeImages as Image[];

                        if (images.length === 0) {
                            throw new Error("no images");
                        }

                        let topContainerId;

                        if (images.length === 1) {
                            const url = `https://graph.facebook.com/v18.0/${
                                brand.get("instagramPage")?.id
                            }/media?caption=${encodeURIComponent(
                                post.get("content") || ""
                            )}&image_url=${encodeURIComponent(
                                (process.env.SUCCULENT_ADDR ||
                                    "http://localhost:3331") +
                                    "/image/" +
                                    images[0].get("imageFile")
                            )}&access_token=${brand.get(
                                "instagramAccessToken"
                            )}`;
                            console.log("POST", url);
                            const res = await await fetch(url, {
                                method: "POST",
                            });
                            res.status !== 200 &&
                                console.log(res.status, await res.text());
                            topContainerId = (
                                (await res.json()) as { id: string }
                            ).id;
                        } else {
                            const containerIds = await Promise.all(
                                images.map(async (image) => {
                                    const existingContainerId = image.get(
                                        "instagramContainerId"
                                    );
                                    if (existingContainerId) {
                                        return existingContainerId;
                                    } else {
                                        const url = `https://graph.facebook.com/v18.0/${
                                            brand.get("instagramPage")?.id
                                        }/media?image_url=${encodeURIComponent(
                                            (process.env.SUCCULENT_ADDR ||
                                                "http://localhost:3331") +
                                                "/image/" +
                                                image.get("imageFile")
                                        )}&access_token=${brand.get(
                                            "instagramAccessToken"
                                        )}`;

                                        console.log("POST", url);

                                        const res = await fetch(url, {
                                            method: "POST",
                                        });
                                        res.status !== 200 &&
                                            console.log(
                                                res.status,
                                                await res.text()
                                            );
                                        const containerId = (
                                            (await res.json()) as { id: string }
                                        ).id;

                                        image.set("instagramContainerId", containerId);

                                        return containerId;
                                    }
                                })
                            );

                            const url = `https://graph.facebook.com/v18.0/${
                                brand.get("instagramPage")?.id
                            }/media?caption=${encodeURIComponent(
                                post.get("content") || ""
                            )}&media_type=CAROUSEL&children=${containerIds.join(
                                "%2C"
                            )}&access_token=${brand.get(
                                "instagramAccessToken"
                            )}`;
                            console.log("POST", url);
                            const res = await fetch(url, {
                                method: "POST",
                            });
                            res.status !== 200 &&
                                console.log(res.status, await res.text());
                            topContainerId = (
                                (await res.json()) as { id: string }
                            ).id;
                        }

                        if (!topContainerId) throw new Error("no container id");

                        const url = `https://graph.facebook.com/v18.0/${
                            brand.get("instagramPage")?.id
                        }/media_publish?creation_id=${topContainerId}&access_token=${brand.get(
                            "instagramAccessToken"
                        )}`;
                        console.log("POST", url);
                        const res = await fetch(url, {
                            method: "POST",
                        });
                        res.status !== 200 &&
                            console.log(res.status, await res.text());
                        const postMediaId = (
                            (await res.json()) as { id: string }
                        ).id;

                        if (!postMediaId) throw new Error("no post media id");
                        post.set("instagram", {
                            state: "posted",
                            postedAt: new Date().toISOString(),
                            postId: postMediaId,
                        });
                    } catch (e) {
                        console.error(
                            "Error posting after post load",
                            postId,
                            e
                        );
                        post.set("instagram", {
                            state: "notScheduled",
                        });
                    }
                } catch (e) {
                    console.error("Error posting", postId, e);
                    actuallyScheduled.set(postId, scheduledAt);
                }
            }
        }

        setTimeout(tryPosting, 10_000);
    };
    setTimeout(tryPosting, 10_000);
}

runner();
