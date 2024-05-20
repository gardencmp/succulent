import { Post, UserTagMap } from '@/sharedDataModel';
import { PostImage } from './PostImage';
import { Textarea } from './ui/textarea';
import { CircleUserRoundIcon, MapPinIcon, XIcon } from 'lucide-react';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';
import { DraftPostScheduler } from './draftPost/DraftPostScheduler';
import { ImageUploader } from './draftPost/ImageUploader';

export function PostComponent({
  post,
  lastScheduledOrPostDate,
}: {
  post: Post;
  lastScheduledOrPostDate?: Date;
}) {
  const [desiredScheduleDate, setDesiredScheduleDate] = useState<Date>();

  const editable = post.instagram.state === 'notScheduled';

  useEffect(() => {
    if (lastScheduledOrPostDate) {
      const baseDate =
        lastScheduledOrPostDate < new Date()
          ? new Date()
          : lastScheduledOrPostDate;
      // next monday or wednesday after lastScheduledOrPostDate, 11:50 AM
      const nextMonday = new Date(baseDate);
      nextMonday.setDate(
        baseDate.getDate() + ((1 + 7 - baseDate.getDay()) % 7)
      );
      nextMonday.setHours(11, 50, 0, 0);

      const nextWednesday = new Date(baseDate);
      nextWednesday.setDate(
        baseDate.getDate() + ((3 + 7 - baseDate.getDay()) % 7)
      );
      nextWednesday.setHours(11, 50, 0, 0);

      if (nextMonday < nextWednesday) {
        setDesiredScheduleDate(nextMonday);
      } else {
        setDesiredScheduleDate(nextWednesday);
      }
    }
  }, [lastScheduledOrPostDate]);

  return (
    <div className="grid grid-cols-3 max-w-full p-6 border rounded gap-2">
      <div className="h-52 aspect-square">
        {post.images?.[0] ? (
          <PostImage post={post} />
        ) : (
          <ImageUploader post={post} />
        )}
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Textarea
          value={post.content}
          onChange={(event) => {
            post.content = event.target.value;
          }}
        />
        <div className="text-sm">
          <div className="flex gap-1 items-center mt-2 opacity-50">
            <MapPinIcon size="1em" />{' '}
            <Input value={'Location'} className="px-2 py-0.5 h-auto" readOnly />
          </div>
          <div className="overflow-x-scroll">
            <div className="flex gap-1 items-center mt-3">
              <CircleUserRoundIcon size="1em" className="flex-shrink-0" />

              {Object.entries(post.userTags || {}).map(([user]) => (
                <div
                  key={user}
                  className="flex gap-1 items-center rounded px-1 bg-stone-700"
                >
                  {user}{' '}
                  {editable && (
                    <XIcon
                      size="1em"
                      className="cursor-pointer"
                      onClick={() => {
                        if (!post.userTags) return;
                        delete post.userTags[user];
                      }}
                    />
                  )}
                </div>
              ))}
              {editable && (
                <div className="flex gap-1 items-center w-24 flex-shrink-0">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!post._refs.userTags) {
                        post.userTags = UserTagMap.create(
                          {},
                          { owner: post._owner }
                        );
                      }
                      if (!post.userTags) return;
                      const element = (event.target as any)
                        .tagUser as HTMLInputElement;
                      const tagUser = element.value;
                      post.userTags[tagUser] = {
                        x: Math.random(),
                        y: Math.random(),
                      };
                      element.value = '';
                    }}
                  >
                    <Input
                      name="tagUser"
                      placeholder="Tag a user"
                      className="px-2 py-0.5 h-auto flex-shrink-0"
                    />
                  </form>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2 items-center">
            <DraftPostScheduler
              post={post}
              desiredScheduleDate={desiredScheduleDate}
              setDesiredScheduleDate={setDesiredScheduleDate}
              schedulePost={(date) => {
                post.instagram = {
                  state: 'scheduleDesired',
                  scheduledAt: date.toISOString(),
                };
              }}
              unschedulePost={() => {
                post.instagram = {
                  state: 'notScheduled',
                };
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
