import {
  InstagramPosted,
  InstagramScheduleDesired,
  InstagramScheduled,
  Post,
} from '@/sharedDataModel';
import { PostTile } from './PostTile';

export function PostGrid({
  posts,
  showInsights,
  deleteDraft,
}: {
  posts: Post<
    InstagramPosted | InstagramScheduleDesired | InstagramScheduled
  >[];
  showInsights: boolean;
  deleteDraft: (post: Post) => void;
  createDraft: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((post, i) => {
        return (
          post && (
            <PostTile
              key={post.id}
              post={post}
              isFirst={i === 0}
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
