import { AccountRoot } from '@/dataModel';
import { Post, Image } from '@/sharedDataModel';
import { Profile, CoStream, CoID } from 'cojson';
import { BrowserImage, createImage } from 'jazz-browser-media-images';
import { Resolved, useJazz } from 'jazz-react';
import { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import { toDateTimeLocal } from '@/lib/dates';

const scheduledPostsStreamId = 'co_zNHLSfAEVwmcE1oJiszREJzeHEy' as CoID<
  CoStream<Post['id']>
>;

export function DraftPostComponent({
  post,
  border = true,
  styling,
  onDelete,
}: {
  post: Resolved<Post>;
  border?: boolean;
  styling?: string;
  onDelete?: () => void;
}) {
  const { me, localNode } = useJazz<Profile, AccountRoot>();
  const [desiredScheduleDate, setDesiredScheduleDate] = useState<Date>();
  const schedule = useCallback(
    async (scheduleAt: Date) => {
      post.set('instagram', {
        state: 'scheduleDesired',
        scheduledAt: scheduleAt.toISOString(),
      });

      const scheduledPostsStream = await localNode.load(scheduledPostsStreamId);

      if (scheduledPostsStream === 'unavailable') {
        throw new Error('scheduledPostsStream unavailable');
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

  const onDeletePhoto = (activeImageId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    post.images?.delete(post.images.findIndex((i) => i?.id === activeImageId));
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
            image &&
            image.imageFile && (
              <div className="relative">
                <Button
                  variant="destructive"
                  className="absolute right-0"
                  // onDeletePhoto={() => setActiveImageId(image.id)}
                  onClick={() => image && onDeletePhoto(image.id)}
                >
                  x
                </Button>
                <img
                  key={image.id}
                  className="w-40 h-40 object-cover shrink-0"
                  src={
                    image.imageFile.as(BrowserImage(500))
                      ?.highestResSrcOrPlaceholder
                  }
                  id={image.id}
                />
              </div>
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
                createImage(file, post.meta.group).then((image) => {
                  post.images?.append(
                    post.meta.group.createMap<Image>({
                      imageFile: image.id,
                    }).id
                  );
                })
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
          post.set('content', event.target.value);
        }}
        placeholder="Post content"
      />
      <div className="flex gap-2 items-center flex-wrap">
        <Input
          type="datetime-local"
          value={
            desiredScheduleDate
              ? toDateTimeLocal(desiredScheduleDate.toISOString())
              : post.instagram.state === 'scheduleDesired' ||
                  post.instagram.state === 'scheduled'
                ? toDateTimeLocal(post.instagram.scheduledAt)
                : undefined
          }
          onChange={(event) => {
            setDesiredScheduleDate(new Date(event.target.value));
          }}
          min={toDateTimeLocal(new Date().toISOString())}
          className="dark:[color-scheme:dark] max-w-[13rem]"
        />
        <div className="whitespace-nowrap mr-auto">
          {post.instagram.state === 'notScheduled' ? (
            desiredScheduleDate ? (
              <Button
                onClick={() => {
                  if (!desiredScheduleDate) return;
                  console.log(
                    'Scheduling for ' + desiredScheduleDate.toISOString()
                  );
                  schedule(desiredScheduleDate);
                }}
              >
                Schedule
              </Button>
            ) : (
              'Not yet scheduled'
            )
          ) : post.instagram.state === 'scheduleDesired' ? (
            <>
              Schedule desired{' '}
              {post.instagram.notScheduledReason ? (
                <span className="text-[0.6em] text-orange-500">
                  (⚠️ {post.instagram.notScheduledReason})
                </span>
              ) : (
                ' (✈️ offline)'
              )}
            </>
          ) : post.instagram.state === 'scheduled' ? (
            'Scheduled'
          ) : post.instagram.state === 'posted' ? (
            'Posted'
          ) : (
            'loading'
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {(post.instagram.state === 'scheduleDesired' ||
          post.instagram.state === 'scheduled') && (
          <>
            {desiredScheduleDate &&
              post.instagram.scheduledAt !==
                desiredScheduleDate.toISOString() && (
                <Button
                  onClick={() => {
                    if (!desiredScheduleDate) return;
                    console.log(
                      'Rescheduling for ' + desiredScheduleDate.toISOString()
                    );
                    schedule(desiredScheduleDate);
                  }}
                  className="ml-2"
                >
                  Reschedule
                </Button>
              )}
            <Button
              variant="outline"
              onClick={() => {
                post.set('instagram', {
                  state: 'notScheduled',
                });
              }}
            >
              Unschedule
            </Button>
          </>
        )}
        <Button variant="destructive" onClick={onDelete}>
          Delete Post
        </Button>
      </div>
      {/* <div className="text-xs">Succulent post id: {post.id}</div> */}
    </div>
  );
}
