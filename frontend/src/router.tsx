import { createHashRouter } from 'react-router-dom';
import { HomeScreen } from './HomeScreen';
import { Preferences } from './Preferences';
import { Drafts } from './Drafts';
import { ScheduleView } from './components/feedView/FeedView';
import { BrandInsightsScreen } from './BrandInsightsScreen';

export const router = createHashRouter([
  {
    path: '/',
    element: <HomeScreen />,
  },
  {
    path: '/brand/:brandId',
    children: [
      {
        path: '/brand/:brandId/schedule/feed',
        element: <ScheduleView />,
      },
      {
        path: '/brand/:brandId/schedule/calendar',
        element: <ScheduleView />,
      },
      {
        path: '/brand/:brandId/schedule/drafts',
        element: <Drafts />,
      },
      {
        path: '/brand/:brandId/insights/brand',
        element: <BrandInsightsScreen />,
      },
      {
        path: '/brand/:brandId/insights/hashtags',
        element: <BrandInsightsScreen />,
      },
      {
        path: '/brand/:brandId/insights/posts',
        element: <BrandInsightsScreen />,
      },
      {
        path: '/brand/:brandId/preferences',
        element: <Preferences />,
      },
    ],
  },

  {
    path: '/invite/*',
    element: <p>Accepting invite...</p>,
  },
  {
    path: '_=_',
    element: <HomeScreen />,
  },
]);
