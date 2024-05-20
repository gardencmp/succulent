import {
  InstagramNotScheduled,
  InstagramScheduleDesired,
  InstagramScheduled,
  Post,
} from '@/sharedDataModel';
import { GripHorizontal, GripVertical } from 'lucide-react';
import { Draggable } from '@/lib/dragAndDrop';
import { PostComponent } from '@/components/PostComponent';

export function DraftPostList({
  posts,
  lastScheduledOrPostDate,
}: {
  posts?: Post<
    InstagramNotScheduled | InstagramScheduleDesired | InstagramScheduled
  >[];
  lastScheduledOrPostDate?: Date;
  deleteDraft: (post: Post) => void;
}) {
  return posts?.map(
    (post) =>
      post && (
        <div className="relative" key={`container-${post.id}`}>
          <Draggable
            postId={post.id}
            className="absolute p-2 -top-2 left-0 right-0 h-8 md:top-0 md:bottom-3 md:-left-2 md:w-8 md:h-auto cursor-grab flex flex-col md:flex-row items-center justify-end opacity-70 hover:opacity-100"
          >
            <GripVertical size={20} className="hidden md:block" />
            <GripHorizontal size={20} className="md:hidden" />
          </Draggable>
          <PostComponent
            key={`drafts-${post.id}`}
            post={post}
            lastScheduledOrPostDate={lastScheduledOrPostDate}
            // onDelete={() => deleteDraft(post)}
          />
        </div>
      )
  );
}
