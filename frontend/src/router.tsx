import { createHashRouter } from 'react-router-dom';
import { HomeScreen } from './HomeScreen';
import { BrandHome } from './BrandHome';
import { BrandInsightsScreen } from './BrandInsightsScreen';
import { BrandScheduleScreen } from './BrandScheduleScreen';
import { Preferences } from './Preferences';
import { Drafts } from './Drafts';

export const router = createHashRouter([
  {
    path: '/',
    element: <HomeScreen />,
  },
  {
    path: '/brand/:brandId',
    element: <BrandHome />,
    children: [
      {
        path: '/brand/:brandId/insights',
        element: <BrandInsightsScreen />,
      },
      {
        path: '/brand/:brandId/schedule',
        element: <BrandScheduleScreen />,
      },
      {
        path: '/brand/:brandId/drafts',
        element: <Drafts />,
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
