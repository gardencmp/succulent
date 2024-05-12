import {
  InstagramPosted,
  InstagramScheduleDesired,
  InstagramScheduled,
  Post,
} from '@/sharedDataModel';
import { Button } from '../../../components/ui/button';
import { useState } from 'react';
import { DraftPostComponent } from '../../../components/draftPost/DraftPost';
import { PostComponent } from '../../../components/Post';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PostInsights } from '../../../components/PostInsights';
import { DropGap } from './DropGap';
import { PostImage } from '../../../components/PostImage';
import { formatDateOnly } from '@/lib/dates';

export function PostTile({
  post,
  isFirst,
  olderPost,
  alwaysShowInsights,
  onDeleteDraft,
}: {
  post: Post<InstagramPosted | InstagramScheduleDesired | InstagramScheduled>;
  isFirst: boolean;
  olderPost?: Post<
    InstagramPosted | InstagramScheduleDesired | InstagramScheduled
  >;
  alwaysShowInsights: boolean;
  onDeleteDraft?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const olderPostDate =
    olderPost &&
    (olderPost.instagram.state === 'posted'
      ? olderPost.instagram.postedAt
      : olderPost.instagram.scheduledAt);

  return (
    <Dialog key={post.id}>
      <div className="col-span-1 aspect-square relative">
        {isFirst && (
          <DropGap
            isLeft
            after={
              post.instagram.state === 'posted'
                ? post.instagram.postedAt
                : post.instagram.scheduledAt
            }
          />
        )}
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex m-0 p-0 h-full w-full rounded-none relative"
            onMouseOver={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {(alwaysShowInsights ||
              hovered ||
              post.instagram.state === 'scheduleDesired') && (
              <PostInsights post={post} />
            )}
            <PostImage post={post} />
            <div className="showOnScroll opacity-0 pointer-events-none transition-opacity absolute top-0 right-2 text-lg md:text-xl [text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">
              {post.instagram.state === 'posted'
                ? formatDateOnly(new Date(post.instagram.postedAt))
                : formatDateOnly(new Date(post.instagram.scheduledAt))}
            </div>
          </Button>
        </DialogTrigger>
        {post.instagram.state !== 'posted' && (
          <DropGap before={post.instagram.scheduledAt} after={olderPostDate} />
        )}
      </div>
      <DialogContent>
        {post?.instagram.state === 'posted' && (
          <PostComponent post={post!} border={false} />
        )}
        {post?.instagram.state !== 'posted' && (
          <DraftPostComponent
            post={post!}
            border={false}
            onDelete={onDeleteDraft}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
