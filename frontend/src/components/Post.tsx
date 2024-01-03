import { AccountRoot } from '@/dataModel';
import { Post, Image } from '@/sharedDataModel';
import { Profile, CoStream, CoID } from 'cojson';
import { BrowserImage, createImage } from 'jazz-browser-media-images';
import { Resolved, useJazz } from 'jazz-react';
import { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

// const scheduledPostsStreamId = 'co_zNHLSfAEVwmcE1oJiszREJzeHEy' as CoID<
//   CoStream<Post['id']>
// >;

export function PostComponent({
  post,
  border = true,
  styling,
}: {
  post: Resolved<Post>;
  border?: boolean;
  styling?: string;
  onDelete?: () => void;
}) {
  const [copiedText, setCopiedText] = useState<string | false>(false);
  const extractHashtags = () => {
    const copyArray = post?.content?.split(' ');
    const hashTags = copyArray?.filter((copy) => copy.charAt(0) === '#');
    return hashTags?.join(', ');
  };

  const copyHashtags = () => {
    const hashTags = extractHashtags();
    hashTags && setCopiedText(hashTags);
    navigator.clipboard.writeText(copiedText as string);
    setTimeout(() => setCopiedText(false), 1000);
  };

  return (
    <div
      className={cn('rounded p-4 flex flex-col gap-4', styling, {
        'border bg-neutral-900': border,
      })}
    >
      <div className="flex gap-2 overflow-x-scroll">
        {post.images?.map(
          (image) =>
            image &&
            image.imageFile && (
              <img
                key={image.id}
                className="w-40 h-40 object-cover shrink-0"
                src={
                  image.imageFile.as(BrowserImage(500))
                    ?.highestResSrcOrPlaceholder
                }
              />
            )
        )}
      </div>
      <div className="relative">
        <Button
          className={cn('absolute right-0 bg-neutral-500', {
            'bg-green-700 hover:bg-green-500': !!copiedText,
          })}
          onClick={copyHashtags}
        >
          #
        </Button>
        <p className="h-40 overflow-auto p-3 bg-neutral-900 whitespace-pre-line">
          {post?.content}
        </p>
      </div>
      <div className="flex gap-2 items-center flex-wrap"></div>
    </div>
  );
}

function toDatetimeLocal(d: Date) {
  const copy = new Date(d);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 16);
}
