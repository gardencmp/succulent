import { Post } from '@/sharedDataModel';
import { Resolved } from 'jazz-react';

export function PostInsights({ post }: { post: Resolved<Post> }) {
  const insights = {
    likes: 99999,
    reach: 68329,
    engagement: 0.86,
  };
  post = { ...post, insights: insights };

  return (
    <div className="absolute grid-cols-3 flex justify-around w-full py-3 bg-neutral-800">
      <div className="col-span-1 flex flex-col">
        <p>🫶</p>
        <p>{post.insights?.likes}</p>
      </div>
      <div className="col-span-1">
        <p>🫳</p>
        <p>{post.insights?.reach}</p>
      </div>
      <div className="col-span-1">
        <p>🙃</p>
        <p>{post.insights?.engagement}%</p>
      </div>
    </div>
  );
}
