import {
  InstagramPosted,
  InstagramScheduleDesired,
  InstagramScheduled,
  Post,
} from '@/sharedDataModel';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { DraftPostComponent } from '../draftPost/DraftPost';
import { PostComponent } from '../Post';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PostInsights } from '../PostInsights';
import { DropGap } from './DropGap';
import { PostImage } from '../PostImage';

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
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    const handleScroll = () => {
      if (timeout) clearTimeout(timeout);
      setScrolling(true);
      timeout = setTimeout(() => setScrolling(false), 1000);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll);
  });

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
            <div
              style={{ opacity: scrolling ? 1 : 0 }}
              className="pointer-events-none transition-opacity absolute top-0 right-2 text-lg md:text-xl [text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]"
            >
              {post.instagram.state === 'posted'
                ? new Date(post.instagram.postedAt).toLocaleString('default', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit',
                  })
                : new Date(post.instagram.scheduledAt).toLocaleString(
                    'default',
                    { day: '2-digit', month: 'short', year: '2-digit' }
                  )}
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
