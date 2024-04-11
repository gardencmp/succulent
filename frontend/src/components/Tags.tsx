import { Tag } from '@/sharedDataModel';
import { AtSign, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { Input } from './ui/input';

export const Tags = ({
  tags,
  setTags,
}: {
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}) => {
  const [addTag, setAddTag] = useState<Boolean>(false);

  const handleRemoveTags = (index: number) => {
    setTags(tags.filter((_t, i) => i != index));
  };

  const handleAddTags = (e) => {
    const activeTags = tags || [];
    if (!e.target.value.length) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      setTags([
        ...activeTags,
        {
          id: 0,
          name: e.target.value,
          x: 0,
          y: 0,
        },
      ]);
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="flex">
      <AtSign className="mr-4" />
      {tags?.length &&
        tags?.map((tag: Tag, index: number) => (
          <p className="outline rounded-md pl-3 mr-3" key={tag.name}>
            {tag.name}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveTags(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </p>
        ))}
      <div className="flex">
        {!addTag && (
          <Button
            variant="outline"
            size="sm"
            className="mx-2"
            onClick={() => setAddTag(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        {addTag && <Input placeholder="Enter tag" onKeyDown={handleAddTags} />}
      </div>
    </div>
  );
};
