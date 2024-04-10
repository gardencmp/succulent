import { AccountRoot } from '@/dataModel';
import { Post, Image, Location, Tag } from '@/sharedDataModel';
import { Profile, CoStream, CoID } from 'cojson';
import { BrowserImage, createImage } from 'jazz-browser-media-images';
import { Resolved, useJazz } from 'jazz-react';
import { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import { toDateTimeLocal } from '@/lib/dates';
import { AtSign, MapPin, X, Plus } from 'lucide-react';

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
  const [addTag, setAddTag] = useState<Boolean>(false);
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

  const testTags = [{ id: 12234, name: 'test1', x: 0, y: 0 }];

  const testPost = {
    ...post,
    location: {
      name: 'London',
      id: 1234,
    },
    tags: testTags,
  };

  const onDeletePhoto = (activeImageId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    post.images?.delete(post.images.findIndex((i) => i?.id === activeImageId));
  };

  const Location = (location: Location) => {
    const testLocation = location.location;

    return (
      <div className="flex align-middle">
        <MapPin className="align-self-middle mr-4" />
        {/* render with a cross to delete input value submitted */}
        {testLocation.name && (
          <div className="flex align-middle text-middle">
            <p className="mr-4 flex text-baseline">{testLocation.name}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                console.log('delete post location', testLocation.name)
              }
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* style input, full width, prompt text*/}
        {!testLocation.name && <Input placeholder="Enter location" />}
      </div>
    );
  };

  const Tags = (tags: Tag[]) => {
    const testTags = tags.tags;

    return (
      <div className="flex">
        <AtSign className="mr-4" />
        {/* list through tags, render in pills with 'x' to delete */}
        {testTags.length &&
          testTags.map((tag: Tag) => (
            <p className="outline rounded-md pl-3">
              {tag.name}
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('delete tag', tag.name)}
              >
                <X className="h-4 w-4" />
              </Button>
            </p>
          ))}
        {/* change to plus button which expands to an input on click, and goes back to plus on form submit */}
        {testTags.length && (
          <div className="flex">
            {!addTag && (
              <Button
                variant="outline"
                size="sm"
                className="mx-2"
                onClick={() => setAddTag(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {addTag && (
              <Input
                placeholder="Enter tag"
                className="ml-3"
                onClick={() => setAddTag(false)}
              />
            )}
          </div>
        )}
      </div>
    );
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
      </div>
      <Location location={testPost.location} />
      <div>
        <Tags tags={testPost.tags} />
      </div>
      <Button variant="destructive" onClick={onDelete}>
        Delete Post
      </Button>
      {/* <div className="text-xs">Succulent post id: {post.id}</div> */}
    </div>
  );
}
