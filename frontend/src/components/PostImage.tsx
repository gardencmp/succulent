import { Post } from '@/sharedDataModel';
import { cn } from '@/lib/utils';
import { ProgressiveImg } from 'jazz-react';

export function PostImage({ post }: { post: Post }) {
  return (
    post.images?.[0] && (
      <ProgressiveImg
        key={post.images[0].id}
        image={post.images[0].imageFile}
        maxWidth={512}
      >
        {({ src }) => (
          <img
            className={cn(
              'block w-full h-full object-cover shrink-0 outline-none hover:opacity-100',
              {
                'opacity-50': post.instagram.state !== 'posted',
              }
            )}
            src={src}
          />
        )}
      </ProgressiveImg>
    )
  );
}
