import React, { lazy } from 'react';

const Runs = lazy(() => import('../pages/Runs/Runs'));
const Metrics = lazy(() => import('../pages/Metrics/Metrics'));

const PATHS = {
  RUNS: '/runs',
  METRICS: '/metrics',
  CORRELATIONS: '/correlations',
  TAGS: '/tags',
  BOOKMARKS: '/bookmarks',
}

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

export {
  PATHS,
  routes,
};
