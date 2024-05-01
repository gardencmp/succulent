import {
  InstagramPosted,
  InstagramScheduleDesired,
  InstagramScheduled,
  Post,
} from '@/sharedDataModel';
import { Button } from '../ui/button';
import { DropGap } from './DropGap';
import { PostTile } from './PostTile';

export function PostGrid({
  posts,
  showInsights,
  deleteDraft,
  createDraft: createDraftPost,
}: {
  posts: Post<
    InstagramPosted | InstagramScheduleDesired | InstagramScheduled
  >[];
  showInsights: boolean;
  deleteDraft: (post: Post) => void;
  createDraft: () => void;
}) {
  const firstPostState = posts[0]?.instagram;
  const firstPostDate =
    firstPostState &&
    (firstPostState.state === 'posted'
      ? firstPostState.postedAt
      : firstPostState.scheduledAt);

  return (
    <div className="grid grid-cols-3">
      <div className="aspect-square m-0 p-1 relative">
        <Button
          variant="outline"
          className="aspect-square m-0 p-0 h-full w-full col-span-1 rounded-none"
          onClick={createDraftPost}
        >
          +
        </Button>
        <DropGap after={firstPostDate} />
      </div>

      {posts.map((post, i) => {
        return (
          post && (
            <PostTile
              key={post.id}
              post={post}
              olderPost={posts[i + 1]}
              alwaysShowInsights={showInsights}
              onDeleteDraft={() => {
                deleteDraft(post);
              }}
            />
          )
        );
      })}
    </div>
  );
}
