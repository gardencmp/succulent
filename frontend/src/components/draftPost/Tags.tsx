import { AtSign, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Post } from '@/sharedDataModel';

export const Tags = ({ post }: { post: Post }) => {
  const tags = post.userTags;
  const handleRemoveTags = async (username: string) => {
    if (!post.userTags) return;
    delete post.userTags[username];
  };

  const handleAddTags = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e.currentTarget.value.length) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!post.userTags || !post.inBrand) return;
      post.userTags[e.currentTarget.value] = {
        x: 0,
        y: 0,
      };
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="flex m-w-100">
      <AtSign className="mr-4" />
      {!!tags &&
        Object.entries(tags).map(([username, _position]) => (
          <p className="outline rounded-md pl-3 mr-3" key={username}>
            {username}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveTags(username)}
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
