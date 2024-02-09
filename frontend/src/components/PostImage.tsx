import { Post } from '@/sharedDataModel';
import { Resolved } from 'jazz-react';
import { BrowserImage } from 'jazz-browser-media-images';
import { cn } from '@/lib/utils';

export function PostImage({ post }: { post: Resolved<Post> }) {
  return (
    post.images?.[0] && (
      <img
        key={post.images[0].id}
        className={cn(
          'block w-full h-full object-cover shrink-0 outline-none hover:opacity-100',
          {
            'opacity-50': post.instagram.state !== 'posted',
          }
        )}
        src={
          post.images[0].imageFile?.as(BrowserImage(500))
            ?.highestResSrcOrPlaceholder
        }
      />
    )
  );
}
