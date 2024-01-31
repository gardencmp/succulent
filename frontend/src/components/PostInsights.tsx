import { Post } from '@/sharedDataModel';
import { Resolved } from 'jazz-react';
import { ReactElement } from 'react';
import {
  Heart,
  HeartHandshake,
  MessageCircle,
  MessageCircleReply,
  Save,
  Smile,
  UserRoundPlus,
  View,
} from 'lucide-react';

export function PostInsights(props: { post: Resolved<Post> }) {
  const insights = props.post.instagramInsights;

  if (!insights) return;

  type PostInsight = {
    title: string;
    icon: ReactElement;
    data: string;
  };

  type Insights = keyof typeof insights;

  const getInteractionPc = () => {
    let interactionPc;
    if (!insights.totalInteractions || !insights.reach) {
      return (interactionPc = '0%');
    }
    interactionPc = (100 * insights?.totalInteractions) / insights.reach;
    return interactionPc.toPrecision(2) + '%';
  };

  const getInsights = (insight: Insights) => {
    const insightData:
      | number
      | { [breakdown: string]: number | undefined }
      | undefined = insights[insight];
    if (!insightData) return '0';
    return insightData.toString();
  };

  const insightsConfig: PostInsight[] = [
    {
      title: 'likes',
      icon: <Heart />,
      data: getInsights('likes'),
    },
    {
      title: 'smile-plus',
      icon: <Smile />,
      data: getInsights('reach'),
    },
    {
      title: 'interactionPc',
      icon: <HeartHandshake />,
      data: getInteractionPc(),
    },
    {
      title: 'comments',
      icon: <MessageCircle />,
      data: getInsights('comments'),
    },
    {
      title: 'saved',
      icon: <Save />,
      data: getInsights('saved'),
    },
    {
      title: 'shared',
      icon: <MessageCircleReply />,
      data: getInsights('shares'),
    },
    {
      title: 'profileVisits',
      icon: <View />,
      data: getInsights('profileVisits'),
    },
    {
      title: 'follows',
      icon: <UserRoundPlus />,
      data: getInsights('follows'),
    },
  ];

  return (
    <div className="absolute grid grid-cols-3 justify-around w-full py-3 bg-neutral-800">
      {insightsConfig.map((insightType) => (
        <div key={insightType.title} className="col-span-1">
          <div className="flex justify-center">{insightType.icon}</div>
          <p>{insightType.data}</p>
        </div>
      ))}
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
