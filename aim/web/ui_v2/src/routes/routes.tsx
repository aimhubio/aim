import React from 'react';

const Runs = React.lazy(() => import('pages/Runs/Runs'));
const Metrics = React.lazy(() => import('pages/Metrics/MetricsContainer'));
const Params = React.lazy(() => import('pages/Params/ParamsContainer'));
const Bookmarks = React.lazy(
  () => import('pages/Bookmarks/BookmarksContainer'),
);
const TagsContainer = React.lazy(() => import('pages/Tags/TagsContainer'));
const CreateTag = React.lazy(() => import('pages/Tags/CreateTag'));
const TagDetail = React.lazy(() => import('pages/Tags/TagDetail'));

const PATHS = {
  RUNS: '/runs',
  METRICS: '/metrics',
  METRICS_ID: '/metrics/:appId',
  PARAMS: '/params',
  TAGS: '/tags',
  CREATE_TAG: '/tags/create',
  TAG_DETAIL: '/tags/:id',
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
  METRICS_ID: {
    path: PATHS.METRICS_ID,
    component: Metrics,
    showInSidebar: false,
    displayName: 'MetricsId',
  },
  PARAMS: {
    path: PATHS.PARAMS,
    component: Params,
    showInSidebar: true,
    displayName: 'Params',
  },
  BOOKMARKS: {
    path: PATHS.BOOKMARKS,
    component: Bookmarks,
    showInSidebar: true,
    displayName: 'Bookmarks',
  },
  TAGS: {
    path: PATHS.TAGS,
    component: TagsContainer,
    showInSidebar: true,
    displayName: 'Tags',
  },
  CREATE_TAG: {
    path: PATHS.CREATE_TAG,
    component: CreateTag,
    showInSidebar: false,
    displayName: 'Create Tag',
  },
  TAG_DETAIL: {
    path: PATHS.TAG_DETAIL,
    component: TagDetail,
    showInSidebar: false,
    displayName: 'Tag Detail',
  },
};

export { PATHS, routes };
