import { Post } from '@/sharedDataModel';
import { Resolved } from 'jazz-react';

export function PostInsights(props: { post: Resolved<Post> }) {
  const insights = props.post.instagramInsights;

  if (!insights) return;

  return (
    <div className="absolute grid grid-cols-3 gap-3 justify-around w-full py-3 bg-neutral-800">
      <div className="col-span-1">
        <p>🫶</p>
        <p>{insights.likes}</p>
      </div>
      <div className="col-span-1">
        <p>🫳</p>
        <p>{insights.reach}</p>
      </div>
      {insights.reach && insights.totalInteractions && (
        <div className="col-span-1">
          <p>🙃</p>
          <p>
            {((100 * insights.totalInteractions) / insights.reach).toPrecision(
              2
            )}
            %
          </p>
        </div>
      )}
      <div className="col-span-1">
        <p>💬</p>
        <p>{insights.comments}</p>
      </div>
      <div className="col-span-1">
        <p>💾</p>
        <p>{insights.saved}</p>
      </div>
      <div className="col-span-1">
        <p>📤</p>
        <p>{insights.shares}</p>
      </div>
      <div className="col-span-1">
        <p>🧐</p>
        <p>{insights.profileVisits}</p>
      </div>
      <div className="col-span-1">
        <p>🐑</p>
        <p>{insights.follows}</p>
      </div>
      <div className="col-span-1">
        <p className="text-[0.5em]">
          {insights.profileActivity &&
            Object.entries(insights.profileActivity).map(([key, val]) => (
              <>
                {key}: {val}
              </>
            ))}
        </p>
      </div>
    </div>
  );
}
