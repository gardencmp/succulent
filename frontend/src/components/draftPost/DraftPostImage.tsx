import { Image } from '@/sharedDataModel';
import { Button } from '../ui/button';
import { BrowserImage } from 'jazz-browser-media-images';
import { Resolved } from 'jazz-react';

export function DraftPostImage({
  image,
  onDeletePhoto,
  onClickPhoto,
  imageSize = 500,
}: {
  image?: Resolved<Image> | undefined;
  onDeletePhoto?: (id: Image['id']) => void;
  onClickPhoto?: () => void;
  imageSize?: number;
}) {
  if (!image?.imageFile) return;

  return (
    <div className="relative w-100 h-100">
      {onDeletePhoto && (
        <Button
          variant="destructive"
          className="absolute right-0"
          onClick={() => image && onDeletePhoto(image.id)}
        >
          x
        </Button>
      )}
      <img
        key={image.id}
        className="w-40 h-40 object-cover shrink-0"
        src={
          image.imageFile.as(BrowserImage(imageSize))
            ?.highestResSrcOrPlaceholder
        }
        id={image.id}
        onClick={() => onClickPhoto && onClickPhoto()}
      />
    </div>
  );
}
