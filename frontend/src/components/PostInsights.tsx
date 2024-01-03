export function PostInsights() {
  const insights = {
    likes: 99999,
    reach: 68329,
    engagement: 0.86,
  };

  return (
    <div className="absolute grid-cols-3 flex justify-around w-full py-3 bg-neutral-800">
      <div className="col-span-1 flex flex-col">
        <p>🫶</p>
        <p>{insights.likes}</p>
      </div>
      <div className="col-span-1">
        <p>🫳</p>
        <p>{insights.reach}</p>
      </div>
      <div className="col-span-1">
        <p>🙃</p>
        <p>{insights.engagement}%</p>
      </div>
    </div>
  );
}
