import { MapPin, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const PostLocation = ({
  locationName,
  setLocationName,
}: {
  locationName: string | null;
  setLocationName: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const handleLocation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLocationName(e.currentTarget.value);
    }
  };

  return (
    <div className="flex align-middle">
      <MapPin className="align-self-middle mr-4" />
      {locationName && (
        <div className="flex align-middle text-middle">
          <p className="mr-4 flex text-baseline">{locationName}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocationName(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!locationName && (
        <Input placeholder="Enter location" onKeyDown={handleLocation} />
      )}
    </div>
  );
};
