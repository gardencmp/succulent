import { Post } from '@/sharedDataModel';
import { useCallback, useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { DraftPostImage } from './DraftPostImage';
import { DraftPostScheduler } from './DraftPostScheduler';
import { ImageUploader } from './ImageUploader';
import { useActiveDraftPost } from '@/BrandHome';
import { useAccount } from '@/main';

export function DraftPostComponent({
  post,
  border = true,
  styling,
  onDelete,
}: {
  post: Post;
  border?: boolean;
  styling?: string;
  onDelete?: () => void;
}) {
  const { me } = useAccount();
  const [desiredScheduleDate, setDesiredScheduleDate] = useState<Date>();
  const { setActiveDraftPost } = useActiveDraftPost();

  const schedule = useCallback(
    async (scheduleAt: Date) => {
      post.instagram = {
        state: 'scheduleDesired',
        scheduledAt: scheduleAt.toISOString(),
      };
    },
    [post]
  );

  const onDeletePhoto = (activeImageId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    post.images?.slice(
      post.images.findIndex((i) => i?.id === activeImageId),
      1
    );
  };

  const onClickPhoto = async (post: Post) => {
    setActiveDraftPost(post);
  };

  return (
    <div
      className={cn('rounded p-4 flex flex-col gap-4', styling, {
        'border bg-neutral-900': border,
      })}
    >
      <div className="flex gap-2 overflow-x-scroll w-full">
        {post?.images?.map(
          (image) =>
            image && (
              <DraftPostImage
                image={image}
                onDeletePhoto={onDeletePhoto}
                onClickPhoto={() => onClickPhoto(post)}
              />
            )
        )}
        <ImageUploader post={post} />
      </div>
      <Textarea
        className="text-lg min-h-[5rem]"
        value={post?.content}
        onChange={(event) => {
          if (!post) return;
          post.content = event.target.value;
        }}
        placeholder="Post content"
      />
      <div className="flex gap-2 items-center flex-wrap">
        <DraftPostScheduler
          post={post}
          desiredScheduleDate={desiredScheduleDate}
          setDesiredScheduleDate={setDesiredScheduleDate}
          unschedulePost={() => {
            post.instagram = {
              state: 'notScheduled',
            };
          }}
          schedulePost={schedule}
        />
        <Button variant="destructive" onClick={onDelete}>
          Delete Post
        </Button>
      </div>
      {/* <div className="text-xs">Succulent post id: {post.id}</div> */}
    </div>
  );
}
