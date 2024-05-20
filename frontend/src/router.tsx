import { createHashRouter } from 'react-router-dom';
import { HomePage } from './pages/home/HomePage';
import { PreferencesPage } from './pages/settings/PreferencesPage';
import { PostingPage } from './pages/posting/PostingPage';
import { BrandInsightsPage } from './pages/insights/brand/BrandInsightsPages';
import { HashtagInsightsPage } from './pages/insights/hashtags/HashtagInsightsPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/brand/:brandId',
    children: [
      {
        path: '/brand/:brandId/posting/feed',
        element: <PostingPage />,
      },
      {
        path: '/brand/:brandId/posting/calendar',
        element: <PostingPage />,
      },
      {
        path: '/brand/:brandId/insights/brand',
        element: <BrandInsightsPage />,
      },
      {
        path: '/brand/:brandId/insights/hashtags',
        element: <HashtagInsightsPage />,
      },
      {
        path: '/brand/:brandId/insights/posts',
        element: <div>TODO</div>,
      },
      {
        path: '/brand/:brandId/settings/preferences',
        element: <PreferencesPage />,
      },
    ],
  },

  {
    path: '/invite/*',
    element: <p>Accepting invite...</p>,
  },
  {
    path: '_=_',
    element: <HomePage />,
  },
]);
