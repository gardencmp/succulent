import { Post } from '@/sharedDataModel';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { DraftPostImage } from './DraftPostImage';
import { PostLocation } from './Location';
import { Tags } from './Tags';

export function ImageTagView({
  post: post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  return (
    <div className=" relative z-30 min-w-[100dvw] min-h-[100dvh] flex justify-center items-center flex-col bg-stone-800/50">
      <Button onClick={onClose} className="right-10 top-10 absolute">
        <X />
      </Button>
      <div className="h-[70dvh] w-[90dvw] flex justify-center bg-stone-950/90 flex-col p-8">
        <PostLocation post={post} />
        <div className="my-8">
          {post.images?.map((image) => (
            <DraftPostImage image={image} key={image?.id} imageSize={800} />
          ))}
        </div>
        <Tags post={post} />
      </div>
    </div>
  );
}
