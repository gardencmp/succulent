import {
  InstagramNotScheduled,
  InstagramPosted,
  InstagramScheduleDesired,
  InstagramScheduled,
  Post,
} from '@/sharedDataModel';
import { Resolved } from 'jazz-react';
import { compareDesc } from 'date-fns';

const scheduledOrPostedStates = ['scheduleDesired', 'scheduled', 'posted'];
const draftStates = ['notScheduled'];

export function filterAndSortScheduledAndPostedPosts(
  posts?: (Resolved<Post> | undefined)[]
) {
  return [...(posts || [])]
    .filter(
      (
        post
      ): post is Resolved<
        Post<InstagramScheduleDesired | InstagramScheduled | InstagramPosted>
      > =>
        !!(
          post &&
          post.instagram &&
          scheduledOrPostedStates.includes(post.instagram.state)
        )
    )
    .sort((a, b) => {
      const dateA = new Date(
        a.instagram.state === 'posted'
          ? a.instagram.postedAt
          : a.instagram.scheduledAt
      );
      const dateB = new Date(
        b.instagram.state === 'posted'
          ? b.instagram.postedAt
          : b.instagram.scheduledAt
      );

      return compareDesc(dateA, dateB);
    });
}

export function filterDraftPosts(posts?: (Resolved<Post> | undefined)[]) {
  return posts?.filter((post): post is Resolved<Post<InstagramNotScheduled>> =>
    draftStates.includes(post?.instagram.state as string)
  );
}
