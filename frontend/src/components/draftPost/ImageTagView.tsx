import { Post } from '@/sharedDataModel';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { DraftPostImage } from './DraftPostImage';
import { PostLocation } from './Location';
import { Tags } from './Tags';

export function ImageTagView({
  activeDraftPost,
  setActiveDraftPost,
}: {
  activeDraftPost: Post;
  setActiveDraftPost: React.Dispatch<React.SetStateAction<Post | null>>;
}) {
  return (
    <div className=" relative z-30 min-w-[100dvw] min-h-[100dvh] flex justify-center items-center flex-col bg-stone-800/50">
      <Button
        onClick={() => setActiveDraftPost(null)}
        className="right-10 top-10 absolute"
      >
        <X />
      </Button>
      <div className="h-[70dvh] w-[90dvw] flex justify-center bg-stone-950/90 flex-col p-8">
        <PostLocation post={activeDraftPost} />
        <div className="my-8">
          {activeDraftPost.images?.map((image) => (
            <DraftPostImage image={image} key={image?.id} imageSize={800} />
          ))}
        </div>
        <Tags post={activeDraftPost} />
      </div>
    </div>
  );
}
