import { Post } from '@/sharedDataModel';
import { Resolved } from 'jazz-react';
import { insightConfigForPost } from '@/lib/postInsights';

export function PostInsights(props: { post: Resolved<Post> }) {
  const storedPrefs = localStorage.getItem('postPreferences');

  return (
    <div className="absolute grid grid-cols-3 justify-around w-full py-3 bg-neutral-800">
      {insightConfigForPost(props.post)?.map(
        (insightType) =>
          storedPrefs?.includes(insightType.id) && (
            <div key={insightType.title} className="col-span-1">
              <div className="flex justify-center">{insightType.icon}</div>
              <p>{insightType.data}</p>
            </div>
          )
      )}
    </div>
  );
}
