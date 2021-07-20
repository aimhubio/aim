import React from 'react';

const Runs = React.lazy(() => import('pages/Runs/Runs'));
const Metrics = React.lazy(() => import('pages/Metrics/MetricsContainer'));

const PATHS = {
  RUNS: '/runs',
  METRICS: '/metrics',
  CORRELATIONS: '/correlations',
  TAGS: '/tags',
  BOOKMARKS: '/bookmarks',
};

const routes = {
  RUNS: {
    path: PATHS.RUNS,
    component: Runs,
    showInSidebar: true,
    displayName: 'Runs',
  },
  METRICS: {
    path: PATHS.METRICS,
    component: Metrics,
    showInSidebar: true,
    displayName: 'Metrics',
  },
};

export { PATHS, routes };
