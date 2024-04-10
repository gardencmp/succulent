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
    if (!e.target.value.length) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      setTags([
        ...tags,
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

  if (!tags) return;

  return (
    <div className="flex">
      <AtSign className="mr-4" />
      {/* list through tags, render in pills with 'x' to delete */}
      {tags?.length &&
        tags.map((tag: Tag, index: number) => (
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
      {/* change to plus button which expands to an input on click, and goes back to plus on form submit */}
      {tags.length && (
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
          {addTag && (
            <Input
              placeholder="Enter tag"
              // onClick={() => setAddTag(false)}
              onKeyDown={handleAddTags}
            />
          )}
        </div>
      )}
    </div>
  );
};
