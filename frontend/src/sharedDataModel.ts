import { CoMap, CoList, Media } from 'cojson';

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

export type Post<S extends InstagramState = InstagramState> = CoMap<{
  inBrand: Brand['id'];
  content?: string;
  images: ListOfImages['id'];
  instagram: S;
  location: string | undefined;
  tags: number[];
  instagramInsights?: {
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
  };
}>;

export type ListOfImages = CoList<Image['id']>;

export type Image = CoMap<{
  imageFile: Media.ImageDefinition['id'];
  instagramContainerId?: string;
}>;

export type ListOfPosts = CoList<Post['id']>;

export type Brand = CoMap<{
  name: string;
  instagramAccessToken?: string;
  instagramAccessTokenValidUntil?: number;
  instagramInsights?: InstagramInsights['id'];
  instagramPage?: { id: string; name: string };
  posts: ListOfPosts['id'];
}>;

export type InstagramInsights = CoMap<{
  [day: string]: {
    impressions?: number;
    reach?: number;
    profileViews?: number;
    accountsEngaged?: number;
  };
}>;

export type ListOfBrands = CoList<Brand['id']>;

export type Location = {
  id: number;
  name: string;
};

export type Tag = {
  id: number;
  name: string;
  x: number;
  y: number;
};
