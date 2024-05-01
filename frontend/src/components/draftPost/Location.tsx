import { MapPin, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Post } from '@/sharedDataModel';

export const PostLocation = ({ post }: { post: Post }) => {
  const location = post.location || null;
  const locationEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // const location = { name: e.currentTarget.value}
      // const rolledLocation = handleLocation({location});
      // post.location = rolledLocation;
    }
  };

  return (
    <div className="flex align-middle">
      <MapPin className="align-self-middle mr-4" />
      {location?.name && (
        <div className="flex align-middle text-middle">
          <p className="mr-4 flex text-baseline">{location.name}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (post.location = null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!location?.name && (
        <Input placeholder="Enter location" onKeyDown={locationEnter} />
      )}
    </div>
  );
};
