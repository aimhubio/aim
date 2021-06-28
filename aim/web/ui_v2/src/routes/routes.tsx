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
  },
  METRICS: {
    path: PATHS.METRICS,
    component: Metrics,
  },
};

export { PATHS, routes };
