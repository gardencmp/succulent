import { Image } from '@/sharedDataModel';
import { Button } from '../ui/button';
import { BrowserImage } from 'jazz-browser-media-images';
import { Resolved } from 'jazz-react';

export function DraftPostImage({
  image,
  onDeletePhoto,
}: {
  image?: Resolved<Image>;
  onDeletePhoto: (id: Image['id']) => void;
}) {
  if (!image?.imageFile) return;

  return (
    <div className="relative">
      <Button
        variant="destructive"
        className="absolute right-0"
        // onDeletePhoto={() => setActiveImageId(image.id)}
        onClick={() => image && onDeletePhoto(image.id)}
      >
        x
      </Button>
      <img
        key={image.id}
        className="w-40 h-40 object-cover shrink-0"
        src={image.imageFile.as(BrowserImage(500))?.highestResSrcOrPlaceholder}
        id={image.id}
      />
    </div>
  );
}
