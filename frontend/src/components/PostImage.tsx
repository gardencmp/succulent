import { Post } from '@/sharedDataModel';
import { ProgressiveImg } from 'jazz-react';
import { CheckIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function PostImage({ post, idx }: { post: Post; idx?: number }) {
  const [visible, setVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isDraftOrScheduled =
    post.instagram?.state === 'notScheduled' ||
    post.instagram?.state === 'scheduleDesired' ||
    post.instagram?.state === 'scheduled';

  // use intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
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
    <div ref={containerRef} className={'w-full h-full relative'}>
      <ProgressiveImg
        image={post.images?.[idx || 0]?.imageFile}
        maxWidth={isDraftOrScheduled ? undefined : visible ? 1024 : 0}
      >
        {({ src, res, originalSize }) =>
          src ? (
            <>
              {isDraftOrScheduled ? (
                res === originalSize?.join('x') ? (
                  <>
                    <CheckIcon className="absolute bottom-1.5 right-2 text-black" />
                    <CheckIcon className="absolute bottom-2 right-2 text-white" />
                  </>
                ) : undefined
              ) : undefined}
              <img
                className="block w-full h-full object-cover shrink-0 outline-none hover:opacity-100"
                src={src}
              />
            </>
          ) : (
            <div className="block w-full h-full bg-stone-800" />
          )
        }
      </ProgressiveImg>
    </div>
  );
}
