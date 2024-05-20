import { Post } from '@/sharedDataModel';
import { insightConfigForPost } from '@/lib/postInsights';
import { formatDateTime } from '@/lib/dates';
import { useAccount } from '@/main';
import { insightTypes } from '@/pages/settings/PreferencesPage';

export function PostInsights(props: { post: Post; full?: boolean }) {
  const { me } = useAccount();
  const insightsOrder =
    me.root?.settings?.perBrand?.[props.post._refs.inBrand.id]
      ?.postInsightsOrder || insightTypes;

  const insightsToShow = props.full ? insightsOrder : insightsOrder.slice(0, 3);

  const insightElems = insightsToShow.flatMap((insightType) => {
    const insightInPost = insightConfigForPost(props.post)?.find(
      (insight) => insight.id === insightType
    );
    return insightInPost
      ? [
          <div
            key={insightInPost.title}
            title={insightInPost.title}
            className="text-xs md:text-base flex items-center gap-1"
          >
            <insightInPost.icon size={'1em'} />
            <p>{insightInPost.data}</p>
          </div>,
        ]
      : [];
  });

  return (
    <>
      <PostState post={props.post} />
      {insightElems?.length ? (
        <div className="flex flex-wrap md:items-center justify-around mt-1">
          {insightElems}
        </div>
      ) : undefined}
    </>
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
      <span className="whitespace-nowrap">
        {date ? formatDateTime(date) : 'Draft'}
      </span>
    </div>
  );
}
