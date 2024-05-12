import { Post } from '@/sharedDataModel';
import { insightConfigForPost } from '@/lib/postInsights';
import { formatDateTime } from '@/lib/dates';

export function PostInsights(props: { post: Post }) {
  const storedPrefs = localStorage.getItem('postPreferences');

  const insightElems = insightConfigForPost(props.post)?.map(
    (insightType) =>
      storedPrefs?.includes(insightType.id) && (
        <div
          key={insightType.title}
          title={insightType.title}
          className="text-xs md:text-sm col-span-1 flex items-center gap-1"
        >
          <insightType.icon size={'1em'} />
          <p>{insightType.data}</p>
        </div>
      )
  );

  return (
    <div className="absolute bg-neutral-800/80 md:bg-neutral-800/65 md:backdrop-blur bottom-1 left-1 right-1 top-1 md:bottom-2 md:left-2 md:right-2 md:top-auto md:max-h-1/2 p-1 md:p-2 rounded-lg">
      <PostState post={props.post} />
      {insightElems?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 justify-around items-center w-full py-2 px-1 md:px-3 md:gap-2">
          {insightElems}
        </div>
      ) : undefined}
    </div>
  );
}

function PostState({ post }: { post: Post }) {
  const [date, prefix, color] =
    post.instagram.state === 'posted'
      ? [new Date(post.instagram.postedAt), 'Posted: ', '']
      : post.instagram.state === 'scheduled'
        ? [new Date(post.instagram.scheduledAt), 'Scheduled: ', '']
        : post.instagram.state === 'scheduleDesired'
          ? [
              new Date(post.instagram.scheduledAt),
              post.instagram.notScheduledReason ? '⚠️ ' : '✈️ ',
              post.instagram.notScheduledReason
                ? 'text-orange-400'
                : 'text-blue-500',
            ]
          : [undefined, undefined, undefined];

  return (
    <div className={color + ' text-[0.7em] leading-tight md:text-sm'}>
      {prefix}
      {date ? formatDateTime(date) : 'Draft'}
    </div>
  );
}
