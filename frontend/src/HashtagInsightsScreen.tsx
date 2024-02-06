import { Resolved, useAutoSub } from 'jazz-react';
import { useParams } from 'react-router-dom';
import { CoID } from 'cojson';
import { Brand, Post } from './sharedDataModel';

export function HashtagInsightsScreen() {
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;

  const brand = useAutoSub(brandId);

  const hashtagsAndTheirPosts: { [hashtag: string]: Resolved<Post>[] } = {};

  for (const post of brand?.posts || []) {
    if (!post?.content) continue;
    const hashtags = post.content.match(/#[a-zA-Z0-9]+/g) || [];

    for (const hashtag of hashtags) {
      if (!hashtagsAndTheirPosts[hashtag]) {
        hashtagsAndTheirPosts[hashtag] = [];
      }

      hashtagsAndTheirPosts[hashtag].push(post);
    }
  }

  const hashtagsAndCombinedReach: { [hashtag: string]: number } =
    Object.fromEntries(
      Object.entries(hashtagsAndTheirPosts).map(([hashtag, posts]) => [
        hashtag,
        posts.reduce(
          (acc, post) => acc + (post?.instagramInsights?.reach || 0),
          0
        ),
      ])
    );

  // Hashtag quality is defined as: avg reach per post with that hashtag / avg reach per post without that hashtag
  const hashtagsAndTheirQuality: [hashtag: string, number][] = Object.entries(
    hashtagsAndCombinedReach
  ).map(([hashtag, combinedReach]) => {
    const avgReachWithHashtag =
      combinedReach / hashtagsAndTheirPosts[hashtag].length;
    const postsWithoutThatHashtag =
      brand?.posts?.filter((post) => !post?.content?.includes(hashtag)) || [];
    const combinedReachWithoutHashtag = postsWithoutThatHashtag.reduce(
      (acc, post) => acc + (post?.instagramInsights?.reach || 0),
      0
    );
    const avgReachWithoutHashtag =
      combinedReachWithoutHashtag / postsWithoutThatHashtag.length;
    return [hashtag, avgReachWithHashtag / avgReachWithoutHashtag] as const;
  });

  hashtagsAndTheirQuality.sort((a, b) => b[1] - a[1]);

  const hashtagsAndTheirAvgEngagement: { [hashtag: string]: number } =
    Object.fromEntries(
      Object.entries(hashtagsAndTheirPosts).map(([hashtag, posts]) => [
        hashtag,
        (100 *
          posts.reduce(
            (acc, post) =>
              acc +
              (post?.instagramInsights?.totalInteractions || 0) /
                (post?.instagramInsights?.reach || 1),
            0
          )) /
          posts.length,
      ])
    );

  return (
    <div>
      <h1>Hashtag Insights</h1>
      <table>
        <thead>
          <tr>
            <th className="p-4">Hashtag</th>
            <th className="p-4">No of posts</th>
            <th className="p-4">Combined reach</th>
            <th className="p-4">"Relative reach quality"</th>
            <th className="p-4">Avg engagement</th>
          </tr>
        </thead>
        <tbody>
          {hashtagsAndTheirQuality.map(([hashtag, quality]) => (
            <tr>
              <td>{hashtag}</td>
              <td>{hashtagsAndTheirPosts[hashtag].length}</td>
              <td>{hashtagsAndCombinedReach[hashtag]}</td>
              <td>{quality.toFixed(2)}</td>
              <td>{hashtagsAndTheirAvgEngagement[hashtag].toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
