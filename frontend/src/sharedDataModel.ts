import { CoList, CoMap, ImageDefinition, co } from 'jazz-tools';

export type Platform = 'Twitter' | 'Instagram' | 'Facebook' | 'TikTok';

export type ISODate = string;

export type InstagramState =
  | InstagramNotScheduled
  | InstagramScheduleDesired
  | InstagramScheduled
  | InstagramPosted;

export type InstagramNotScheduled = {
  state: 'notScheduled';
};

export type InstagramScheduleDesired = {
  state: 'scheduleDesired';
  scheduledAt: ISODate;
  notScheduledReason?: string;
};

export type InstagramScheduled = {
  state: 'scheduled';
  scheduledAt: ISODate;
};

export type InstagramPosted = {
  state: 'posted';
  postedAt: ISODate;
  postId: string;
  permalink: string;
};

export class Post<out S extends InstagramState = InstagramState> extends CoMap {
  inBrand: co<Brand | null> = co.ref(Brand);
  content? = co.string;
  images = co.ref(ListOfImages);
  instagram = co.json<S>();
  location = co.ref(Location);
  userTags = co.ref(UserTagMap);
  instagramInsights? = co.json<{
    profileVisits?: number;
    impressions?: number;
    totalInteractions?: number;
    reach?: number;
    likes?: number;
    comments?: number;
    saved?: number;
    shares?: number;
    follows?: number;
    profileActivity?: {
      [breakdown: string]: number | undefined;
    };
  }>();
}

export class Image extends CoMap {
  imageFile = co.ref(ImageDefinition);
  instagramContainerId? = co.string;
}

export class ListOfImages extends CoList.Of(co.ref(Image)) {}

export class Brand extends CoMap {
  name = co.string;
  instagramAccessToken? = co.string;
  instagramAccessTokenValidUntil? = co.number;
  instagramInsights? = co.ref(BrandInstagramInsights);
  instagramPage? = co.json<{ id: string; name: string }>();
  posts = co.ref(ListOfPosts);
  usedLocations = co.ref(ListOfLocations);
  usedUserTags = co.ref(UserTagList);
}

export class ListOfBrands extends CoList.Of(co.ref(Brand)) {}

export class ListOfPosts extends CoList.Of(co.ref(Post)) {}

export class Location extends CoMap {
  fbId? = co.string;
  name = co.string;
}

export class ListOfLocations extends CoList.Of(co.ref(Location)) {}

/** map from username to position */
export class UserTagMap extends CoMap.Record(
  co.json<{
    x: number;
    y: number;
  }>()
) {}

export class UserTagList extends CoList.Of(co.string) {}

export type DayInsights = {
  impressions?: number;
  reach?: number;
  profileViews?: number;
  accountsEngaged?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class BrandInstagramInsights extends CoMap {
  [co.items] = co.json<DayInsights>();
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface BrandInstagramInsights extends Record<string, DayInsights> {}
