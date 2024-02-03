import { Post } from '@/sharedDataModel';
import { Resolved } from 'jazz-react';
import { Heart, HeartHandshake, Smile } from 'lucide-react';
import { ReactElement } from 'react';

export function insightConfigForPost(post: Resolved<Post>) {
  const insights = post.instagramInsights;
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
    // {
    //   title: 'comments',
    //   icon: <MessageCircle />,
    //   data: getInsights('comments'),
    // },
    // {
    //   title: 'saved',
    //   icon: <Save />,
    //   data: getInsights('saved'),
    // },
    // {
    //   title: 'shared',
    //   icon: <MessageCircleReply />,
    //   data: getInsights('shares'),
    // },
    // {
    //   title: 'profileVisits',
    //   icon: <View />,
    //   data: getInsights('profileVisits'),
    // },
    // {
    //   title: 'follows',
    //   icon: <UserRoundPlus />,
    //   data: getInsights('follows'),
    // },
  ];

  return insightsConfig;
}
