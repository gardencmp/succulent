import { Co, CoList, indexSignature } from 'jazz-tools';

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

export class Post<S extends InstagramState = InstagramState> extends Co.Map<
  Post<InstagramState>
> {
  declare inBrand: Brand | null;
  declare content?: string;
  declare images: CoList<Image | null> | null;
  declare instagram: S;
  declare instagramInsights?: {
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

  static {
    this.define({
      inBrand: { ref: () => Brand },
      content: 'json',
      images: { ref: () => ListOfImages },
      instagram: 'json',
      instagramInsights: 'json',
    });
  }
}

export class Image extends Co.Map<Image> {
  declare imageFile: Co.media.ImageDef | null;
  declare instagramContainerId?: string;

  static {
    this.define({
      imageFile: { ref: () => Co.media.ImageDef },
      instagramContainerId: 'json',
    });
  }
}

export class ListOfImages extends Co.List<Image | null>({ ref: () => Image }) {}

export class Brand extends Co.Map<Brand> {
  declare name: string;
  declare instagramAccessToken?: string;
  declare instagramAccessTokenValidUntil?: number;
  declare instagramInsights?: BrandInstagramInsights | null;
  declare instagramPage?: { id: string; name: string };
  declare posts: ListOfPosts | null;

  static {
    this.define({
      name: 'json',
      instagramAccessToken: 'json',
      instagramAccessTokenValidUntil: 'json',
      instagramInsights: { ref: () => BrandInstagramInsights },
      instagramPage: 'json',
      posts: { ref: () => ListOfPosts },
    });
  }
}

export class ListOfBrands extends Co.List<Brand | null>({ ref: () => Brand }) {}

export class ListOfPosts extends Co.List<Post | null>({ ref: () => Post }) {}

export type DayInsights = {
  impressions?: number;
  reach?: number;
  profileViews?: number;
  accountsEngaged?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class BrandInstagramInsights extends Co.Map<BrandInstagramInsights> {
  declare [indexSignature]: DayInsights;

  static {
    this.define({
      [indexSignature]: 'json',
    });
  }
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface BrandInstagramInsights extends Record<string, DayInsights> {}
