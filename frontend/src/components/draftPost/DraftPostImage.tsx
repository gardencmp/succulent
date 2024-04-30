import { Image } from '@/sharedDataModel';
import { Button } from '../ui/button';
import { ProgressiveImg } from 'jazz-react';

export function DraftPostImage({
  image,
  onDeletePhoto,
  onClickPhoto,
  imageSize = 512,
}: {
  image?: Image | null;
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
      <ProgressiveImg image={image.imageFile} maxWidth={imageSize}>
        {({ src }) => (
          <img
            key={image.id}
            className="w-40 h-40 object-cover shrink-0"
            src={src}
            id={image.id}
            onClick={() => onClickPhoto && onClickPhoto()}
          />
        )}
      </ProgressiveImg>
    </div>
  );
}
