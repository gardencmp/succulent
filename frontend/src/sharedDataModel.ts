import { CoMap, CoList, Media } from "cojson";

export type Platform = "Twitter" | "Instagram" | "Facebook" | "TikTok";

type ISODate = string;

export type InstagramState =
    | {
          state: "notScheduled";
      }
    | {
          state: "scheduleDesired";
          scheduledAt: ISODate;
      }
    | {
          state: "scheduled";
          scheduledAt: ISODate;
      }
    | {
          state: "posted";
          postedAt: ISODate;
          postId: string;
      };

export type Post = CoMap<{
    inBrand: Brand["id"];
    content?: string;
    images: ListOfImages["id"];
    instagram: InstagramState;
}>;

export type ListOfImages = CoList<Image["id"]>;

export type Image = CoMap<{
    imageFile: Media.ImageDefinition["id"];
    instagramContainerId?: string;
}>;

export type ListOfPosts = CoList<Post["id"]>;

export type Brand = CoMap<{
    name: string;
    instagramAccessToken?: string;
    instagramAccessTokenValidUntil?: number;
    instagramInsights?: InstagramInsights["id"];
    instagramPage?: {id: string, name: string};
    posts: ListOfPosts["id"];
}>;

export type InstagramInsights = CoMap<{
    [day: string]: {
        impressions?: number;
        reach?: number;
        profileViews?: number;
        accountsEngaged?: number;
    };
}>;

export type ListOfBrands = CoList<Brand["id"]>;