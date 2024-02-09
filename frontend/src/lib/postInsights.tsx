import { Post } from '@/sharedDataModel';
import { Resolved } from 'jazz-react';
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
import { ReactElement } from 'react';

export function insightConfigForPost(post: Resolved<Post>) {
  const insights = post.instagramInsights;
  if (!insights) return;

  type PostInsight = {
    id: string;
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
      id: 'likes',
      title: 'likes',
      icon: <Heart />,
      data: getInsights('likes'),
    },
    {
      id: 'reach',
      title: 'reach',
      icon: <Smile />,
      data: getInsights('reach'),
    },
    {
      id: 'totalInteractions',
      title: 'interactionPc',
      icon: <HeartHandshake />,
      data: getInteractionPc(),
    },
    {
      id: 'comments',
      title: 'comments',
      icon: <MessageCircle />,
      data: getInsights('comments'),
    },
    {
      id: 'saves',
      title: 'saves',
      icon: <Save />,
      data: getInsights('saved'),
    },
    {
      id: 'shares',
      title: 'shares',
      icon: <MessageCircleReply />,
      data: getInsights('shares'),
    },
    {
      id: 'profileActivity',
      title: 'profileVisits',
      icon: <View />,
      data: getInsights('profileVisits'),
    },
    {
      id: 'follows',
      title: 'follows',
      icon: <UserRoundPlus />,
      data: getInsights('follows'),
    },
    {
      id: 'impressions',
      title: 'impressions',
      icon: <UserRoundPlus />,
      data: getInsights('impressions'),
    },
  ];

  return insightsConfig;
}
