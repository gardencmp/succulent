import { Tag } from '@/sharedDataModel';
import { AtSign, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Resolved } from 'jazz-react';
import { Post } from '@/sharedDataModel';
import { handleTags } from '../../../../backend/src/handleTags'

export const Tags = ({ post }: { post: Resolved<Post> }) => {
  const tags = post.tags || [];
  const handleRemoveTags = async (index: number) => {
    const allTags = tags.filter((_t, i) => i != index);
    const rolledTags = handleTags({ tags: allTags });
    post.set('tags', rolledTags)
  };

  const handleAddTags = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const activeTags = tags || [];
    if (!e.currentTarget.value.length) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      const allTags = [
        ...activeTags,
        {
          id: 0,
          username: e.currentTarget.value,
          x: 0,
          y: 0,
        },
      ];
      const rolledTags = handleTags({ tags: allTags });
      post.set('tags', rolledTags)
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="flex m-w-100">
      <AtSign className="mr-4" />
      {!!tags && tags?.map((tag: Tag, index: number) => (
          <p className="outline rounded-md pl-3 mr-3" key={tag.username}>
            {tag.username}
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
      {/* <div className="flex">
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
        {addTag && <Input placeholder="Enter tag" onKeyDown={handleAddTags} />} */}
        <Input placeholder="Enter tag" onKeyDown={handleAddTags} />
      </div>
    </div>
  );
};
