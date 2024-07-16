import { Post, UserTagMap } from '@/sharedDataModel';
import { PostImage } from './PostImage';
import { Textarea } from './ui/textarea';
import { Trash2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DraftPostScheduler } from './draftPost/DraftPostScheduler';
import { ImageUploader } from './draftPost/ImageUploader';
import { Button } from './ui/button';
import { useDeleteDraft } from '@/lib/deleteDraft';
import CreatableSelect from 'react-select/creatable';
import { HashtagInsights } from '@/pages/insights/hashtags/collectHashtagInsights';
import { ClassNamesConfig } from 'node_modules/react-select/dist/declarations/src';
import { HashtagManager } from './HashtagManager';
import { LargePopoverOrDialog } from './PopoverOrDialog';

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
    () =>
      (allUserTags || []).map((user) => ({ user, x: undefined, y: undefined })),
    [allUserTags]
  );
  const currentUserTagsValue = useMemo(
    () =>
      Object.entries(post.userTags || {}).map(
        ([user, pos]) =>
          ({ user, ...pos }) as {
            user: string;
            x: number | undefined;
            y: number | undefined;
          }
      ),
    [post.userTags]
  );

  const [contentWithoutHashTags, currentHashTags] = useMemo(
    () =>
      post.content
        ? [
            post.content.split('#')[0],
            (post.content.match(/(#[a-zA-Z_]+\b)/g) || []).map((tag) =>
              tag.replace('#', '')
            ),
          ]
        : ['', []],
    [post.content]
  );

  const classNames = {
    container() {
      return 'px-2 rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground [&:has(:focus-visible)]:outline-none [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-ring [&:has(:focus-visible)]:ring-offset-2';
    },
    valueContainer() {
      return 'cursor-text';
    },
    multiValue() {
      return 'relative group';
    },
    multiValueLabel() {
      return 'text-xs bg-stone-700 text-stone-100 px-1 rounded-sm mr-1 mb-1 group-hover:line-through group-hover:text-red-500';
    },
    multiValueRemove() {
      return 'absolute top-0 right-0 p-1 rounded-sm cursor-pointer w-full opacity-0 peer';
    },
    menu() {
      return 'p-2 bg-white z-50 border rounded-lg dark:bg-stone-800 dark:text-stone-100';
    },
    menuList() {
      return 'flex flex-wrap';
    },
    group() {
      return 'flex flex-wrap gap-1';
    },
    option() {
      return 'px-1 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-sm !w-auto cursor-pointer';
    },
  } satisfies ClassNamesConfig;

  return (
    <div className="grid grid-cols-3 max-w-full gap-2 relative">
      {/* <div className='text-xs whitespace-pre col-span-3'>{post.content}</div> */}
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
      <div className="col-span-2 border rounded-xl p-px">
        <Textarea
          value={contentWithoutHashTags}
          onChange={(event) => {
            post.content = event.target.value + currentHashTags.join(' ');
          }}
          className={
            'min-h-0 h-fit border-transparent p-2' +
            (!editable &&
              ' focus-visible:ring-offset-0 focus-visible:ring-transparent')
          }
          readOnly={!editable}
        />
        <div className="text-sm border-t">
          <div className="flex gap-1 items-center mt-3">
            <LargePopoverOrDialog
              side="left"
              trigger={
                <div className="min-w-full overflow-x-scroll whitespace-nowrap px-2 cursor-text pb-4 -mb-6">
                  {currentHashTags.map((tag) => '#' + tag).join(' ')}
                </div>
              }
            >
              {(open) => (
                <HashtagManager
                  focusTrigger={open}
                  contextHint={'Hashtags on ' + contentWithoutHashTags}
                  hashtagGroupsId={post.inBrand?._refs.hashtagGroups.id}
                  selected={currentHashTags}
                  hashtagInsights={allHashTags}
                  onSelectedChange={(newSelected) => {
                    post.content =
                      contentWithoutHashTags +
                      newSelected.map((tag) => '#' + tag).join(' ');
                  }}
                />
              )}
            </LargePopoverOrDialog>

            {/* <CreatableSelect
              isMulti
              isClearable={false}
              isDisabled={!editable}
              allowCreateWhileLoading
              options={allHashTagsOptions}
              className="absolute z-50 flex-1"
              value={currentHashTagsValue}
              getOptionLabel={(option) =>
                `${option.tag} (${
                  option.quality == undefined ? '?' : option.quality.toFixed(2)
                })`
              }
              getOptionValue={(option) => option.tag}
              getNewOptionData={(inputValue) => ({
                tag: '#' + inputValue,
                quality: undefined,
              })}
              onChange={(newHashTags) => {
                post.content =
                  contentWithoutHashTags +
                  newHashTags.map((tag) => tag.tag).join(' ');
              }}
              unstyled
              classNames={classNames}
              closeMenuOnSelect={false}
            /> */}
          </div>
          <div className="flex gap-1 items-center mt-3">
            <CreatableSelect
              isMulti
              isClearable={false}
              isDisabled={!editable}
              allowCreateWhileLoading
              options={allUserTagOptions}
              className="absolute z-40 flex-1"
              value={currentUserTagsValue}
              getOptionLabel={(option) => '@' + option.user}
              getOptionValue={(option) => option.user}
              getNewOptionData={(inputValue) => ({
                user: inputValue,
                x: undefined,
                y: undefined,
              })}
              onChange={(newUserTags) => {
                if (!post.userTags) {
                  post.userTags = UserTagMap.create({}, { owner: post._owner });
                }
                for (const newUserTag of newUserTags) {
                  post.userTags[newUserTag.user] = {
                    x: newUserTag.x || Math.random(),
                    y: newUserTag.y || Math.random(),
                  };
                }
                for (const maybeDeletedUser of Object.keys(
                  post.userTags || {}
                )) {
                  if (
                    !newUserTags.find((tag) => tag.user === maybeDeletedUser)
                  ) {
                    delete post.userTags[maybeDeletedUser];
                  }
                }
              }}
              unstyled
              classNames={classNames}
              closeMenuOnSelect={false}
            />
          </div>
          {/* <div className="flex gap-1 items-center mt-2 opacity-50">
            <MapPinIcon size="1em" />{' '}
            <Input value={'Location'} className="px-2 py-0.5 h-auto" disabled />
          </div> */}
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
