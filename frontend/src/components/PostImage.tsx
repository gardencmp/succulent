import { Post } from '@/sharedDataModel';
import { cn } from '@/lib/utils';
import { ProgressiveImg } from 'jazz-react';
import { useEffect, useRef, useState } from 'react';

export function PostImage({ post }: { post: Post }) {
  const [visible, setVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // use intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      }
    );

    observer.observe(containerRef.current!);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={'w-full h-full'}>
      <ProgressiveImg
        image={post.images?.[0]?.imageFile}
        maxWidth={visible ? 1024 : 0}
      >
        {({ src }) =>
          src ? (
            <img
              className={cn(
                'block w-full h-full object-cover shrink-0 outline-none hover:opacity-100',
                {
                  'opacity-50': post.instagram.state !== 'posted',
                }
              )}
              src={src}
            />
          ) : (
            <div className="block w-full h-full bg-neutral-800" />
          )
        }
      </ProgressiveImg>
    </div>
  );
}
