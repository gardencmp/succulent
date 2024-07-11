import { Post, UserTagMap } from '@/sharedDataModel';
import { PostImage } from './PostImage';
import { Textarea } from './ui/textarea';
import {
  CircleUserRoundIcon,
  HashIcon,
  MapPinIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { Input } from './ui/input';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DraftPostScheduler } from './draftPost/DraftPostScheduler';
import { ImageUploader } from './draftPost/ImageUploader';
import { Button } from './ui/button';
import { useDeleteDraft } from '@/lib/deleteDraft';
import CreatableSelect from 'react-select/creatable';
import { HashtagInsights } from '@/pages/insights/hashtags/collectHashtagInsights';

export function PostComponent({
  post,
  lastScheduledOrPostDate,
  allHashTags,
  allUserTags,
}: {
  post: Post;
  lastScheduledOrPostDate?: Date;
  allHashTags?: HashtagInsights[];
  allUserTags?: string[];
}) {
  const [desiredScheduleDate, setDesiredScheduleDate] = useState<Date>();

  const editable = post.instagram.state !== 'posted';

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

  const deleteDraft = useDeleteDraft(post.inBrand);

  const allUserTagOptions = useMemo(
    () => (allUserTags || []).map((user) => ({ user })),
    [allUserTags]
  );
  const currentUserTagsValue = useMemo(
    () => Object.keys(post.userTags || {}).map((user) => ({ user })),
    [post.userTags]
  );

  const [contentWithoutHashTags, currentHashTags] = useMemo(
    () =>
      post.content
        ? [
            post.content.split('#')[0],
            post.content.match(/(#[a-zA-Z]+\b)/g) || [],
          ]
        : ['', []],
    [post.content]
  );

  const allHashTagsOptions = useMemo(
    () =>
      allHashTags?.map((insights) => ({
        tag: insights.hashtag,
        quality: insights.relativeReachQuality,
      })) || [],
    [allHashTags]
  );

  const currentHashTagsValue = useMemo(
    () =>
      currentHashTags.map(
        (tag) =>
          allHashTagsOptions.find((t) => t.tag === tag) || {
            tag,
            quality: undefined,
          }
      ),
    [currentHashTags, allHashTagsOptions]
  );

  const classNames = {
    menu() {
      return 'p-2 bg-white z-50 border rounded-lg';
    },
    menuList() {
      return 'flex flex-wrap';
    },
    group() {
      return 'flex flex-wrap gap-1';
    },
    option() {
      return 'px-1 py-2 hover:bg-stone-100 rounded-sm !w-auto';
    },
  } as const;

  return (
    <div className="grid grid-cols-3 max-w-full gap-2 relative">
      <div
        key={post.images?.length}
        className="w-full max-w-52 aspect-square md:row-span-2 overflow-x-scroll flex snap-mandatory snap-x"
      >
        {post.images?.map((_, idx) => (
          <div
            key={idx}
            className="group shrink-0 h-full aspect-square snap-center relative"
          >
            <PostImage post={post} idx={idx} />
            {editable && (
              <Button
                className="hidden group-hover:flex absolute top-1 right-1 text-white hover:bg-red-500 p-0 h-8 aspect-square justify-center"
                variant="ghost"
                onClick={() => {
                  if (!post.images) return;
                  post.images.splice(idx, 1);
                }}
              >
                <Trash2Icon size={20} />
              </Button>
            )}
          </div>
        ))}
        {editable && (
          <div className="shrink-0 h-full aspect-square snap-center">
            <ImageUploader post={post} />
          </div>
        )}
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Textarea
          value={contentWithoutHashTags.replace(/\n/g, '↵')}
          onChange={(event) => {
            post.content = event.target.value;
          }}
          className={'min-h-0 h-auto ' + (editable ? '' : 'border-transparent')}
        />
        <div className="text-sm">
          <div className="flex gap-1 items-center mt-3">
            <CreatableSelect
              isMulti
              isClearable={false}
              allowCreateWhileLoading
              options={allHashTagsOptions}
              className="absolute z-50 flex-1"
              value={currentHashTagsValue}
              getOptionLabel={(option) =>
                `${option.tag} (${
                  option.quality == undefined
                    ? 'unknown'
                    : option.quality.toFixed(2)
                })`
              }
              getOptionValue={(option) => option.tag}
              getNewOptionData={(inputValue) => ({
                tag: '#' + inputValue,
                quality: undefined,
              })}
              onChange={(val) => console.log(val)}
              unstyled
              classNames={classNames}
              closeMenuOnSelect={false}
            />
          </div>
          <div className="flex gap-1 items-center mt-3">
            <CreatableSelect
              isMulti
              isClearable={false}
              allowCreateWhileLoading
              options={allUserTagOptions}
              className="absolute z-40 flex-1"
              value={currentUserTagsValue}
              getOptionLabel={(option) => '@' + option.user}
              getOptionValue={(option) => option.user}
              getNewOptionData={(inputValue) => ({ user: inputValue })}
              onChange={(val) => console.log(val)}
              unstyled
              classNames={classNames}
              closeMenuOnSelect={false}
            />
          </div>
          <div className="flex gap-1 items-center mt-2 opacity-50">
            <MapPinIcon size="1em" />{' '}
            <Input value={'Location'} className="px-2 py-0.5 h-auto" disabled />
          </div>
        </div>
      </div>
      <div className="col-span-3 md:col-span-2 md:col-start-2">
        <div>
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
            {editable && (
              <Button
                variant="ghost"
                className="p-0 aspect-square hover:bg-red-500"
                onClick={() => {
                  deleteDraft(post);
                }}
              >
                <Trash2Icon size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
