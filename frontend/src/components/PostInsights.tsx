import { Post } from '@/sharedDataModel';
import { insightConfigForPost } from '@/lib/postInsights';

export function PostInsights(props: { post: Post }) {
  const storedPrefs = localStorage.getItem('postPreferences');

  const insightElems = insightConfigForPost(props.post)?.map(
    (insightType) =>
      storedPrefs?.includes(insightType.id) && (
        <div
          key={insightType.title}
          title={insightType.title}
          className="col-span-1 flex items-center gap-1"
        >
          <insightType.icon size={17} />
          <p>{insightType.data}</p>
        </div>
      )
  );

  return (
    <div className="absolute bg-neutral-800/65 backdrop-blur bottom-2 left-2 right-2 max-h-1/2 p-2 rounded-lg">
      <PostState post={props.post} />
      {insightElems?.length ? (
        <div className="grid grid-cols-3 justify-around items-center w-full py-2 px-3 gap-2">
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
    <div className={color}>
      {prefix}
      {date ? date.toLocaleString() : 'Draft'}
    </div>
  );
}
