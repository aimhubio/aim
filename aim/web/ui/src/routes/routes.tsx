import React from 'react';

import { PathEnum } from 'config/enums/routesEnum';
import pageTitlesEnum from 'config/pageTitles/pageTitles';

const Runs = React.lazy(
  () => import(/* webpackChunkName: "runs" */ 'pages/Runs/RunsContainer'),
);
const RunDetail = React.lazy(
  () => import(/* webpackChunkName: "run" */ 'pages/RunDetail/RunDetail'),
);
const Experiment = React.lazy(
  () => import(/* webpackChunkName: "run" */ 'pages/Experiment/Experiment'),
);
const Metrics = React.lazy(
  () =>
    import(/* webpackChunkName: "metrics" */ 'pages/Metrics/MetricsContainer'),
);
const Params = React.lazy(
  () => import(/* webpackChunkName: "params" */ 'pages/Params/ParamsContainer'),
);
const Bookmarks = React.lazy(
  () =>
    import(
      /* webpackChunkName: "bookmarks" */ 'pages/Bookmarks/BookmarksContainer'
    ),
);
const Dashboard = React.lazy(
  () => import(/* webpackChunkName: "dashboard" */ 'pages/Dashboard/Dashboard'),
);
const TagsContainer = React.lazy(
  () => import(/* webpackChunkName: "tags" */ 'pages/Tags/TagsContainer'),
);
const Scatters = React.lazy(
  () =>
    import(
      /* webpackChunkName: "scatters" */ 'pages/Scatters/ScattersContainer'
    ),
);
const ImagesExplore = React.lazy(
  () =>
    import(
      /* webpackChunkName: "images" */ 'pages/ImagesExplore/ImagesExplore'
    ),
);
const FiguresExplore = React.lazy(
  () => import(/* webpackChunkName: "figures" */ 'pages/FiguresExplorer'),
);
const AudiosExplorer = React.lazy(
  () => import(/* webpackChunkName: "audios" */ 'pages/AudiosExplorer'),
);
const MetricsExplorer = React.lazy(
  () => import(/* webpackChunkName: "metrics_v2" */ 'pages/MetricsExplorer'),
);

const TextExplorer = React.lazy(
  () => import(/* webpackChunkName: "text" */ 'pages/TextExplorer'),
);

const Reports = React.lazy(
  () => import(/* webpackChunkName: "Reports" */ 'pages/Reports'),
);

const Report = React.lazy(
  () => import(/* webpackChunkName: "Report" */ 'pages/Report/Report'),
);

export interface IRoute {
  path: PathEnum;
  component:
    | React.LazyExoticComponent<
        () => React.FunctionComponentElement<React.ReactNode>
      >
    | any;
  showInSidebar: boolean;
  displayName: string | null;
  icon?: string | null;
}

const routes: { [key: string]: any } = {
  DASHBOARD: {
    path: PathEnum.Dashboard,
    component: Dashboard,
    showInSidebar: false,
    displayName: 'Dashboard',
    icon: 'dashboard',
    isExact: true,
    title: pageTitlesEnum.DASHBOARD,
  },
  RUNS: {
    path: PathEnum.Runs,
    component: Runs,
    showInSidebar: true,
    displayName: 'Runs',
    icon: 'runs',
    isExact: true,
    title: pageTitlesEnum.RUNS_EXPLORER,
  },
  METRICS: {
    path: PathEnum.Metrics,
    component: Metrics,
    showInSidebar: true,
    displayName: 'Metrics',
    icon: 'metrics',
    isExact: true,
    title: pageTitlesEnum.METRICS_EXPLORER,
  },
  METRICS_ID: {
    path: PathEnum.Metrics_Id,
    component: Metrics,
    showInSidebar: false,
    displayName: 'MetricsId',
    isExact: true,
    title: pageTitlesEnum.METRICS_EXPLORER,
  },
  PARAMS: {
    path: PathEnum.Params,
    component: Params,
    showInSidebar: true,
    displayName: 'Params',
    icon: 'params',
    isExact: true,
    title: pageTitlesEnum.PARAMS_EXPLORER,
  },
  PARAMS_ID: {
    path: PathEnum.Params_Id,
    component: Params,
    showInSidebar: false,
    displayName: 'ParamsId',
    isExact: true,
    title: pageTitlesEnum.PARAMS_EXPLORER,
  },
  TEXT_EXPLORER: {
    path: PathEnum.Text_Explorer,
    component: TextExplorer,
    showInSidebar: true,
    icon: 'text',
    displayName: 'Text',
    isExact: true,
    title: pageTitlesEnum.TEXT_EXPLORER,
  },
  IMAGE_EXPLORE: {
    path: PathEnum.Images_Explore,
    component: ImagesExplore,
    showInSidebar: true,
    displayName: 'Images',
    icon: 'images',
    isExact: true,
    title: pageTitlesEnum.IMAGES_EXPLORER,
  },
  IMAGE_EXPLORE_ID: {
    path: PathEnum.Images_Explore_Id,
    component: ImagesExplore,
    showInSidebar: false,
    displayName: 'ImagesId',
    isExact: true,
    title: pageTitlesEnum.IMAGES_EXPLORER,
  },
  FIGURES_EXPLORER: {
    path: PathEnum.Figures_Explorer,
    component: FiguresExplore,
    showInSidebar: true,
    icon: 'figures',
    displayName: 'Figures',
    isExact: true,
    title: pageTitlesEnum.FIGURES_EXPLORER,
  },
  AUDIOS_EXPLORER: {
    path: PathEnum.Audios_Explorer,
    component: AudiosExplorer,
    showInSidebar: true,
    icon: 'audios',
    displayName: 'Audios',
    isExact: true,
    title: pageTitlesEnum.AUDIOS_EXPLORER,
  },
  SCATTERS: {
    path: PathEnum.Scatters,
    component: Scatters,
    showInSidebar: true,
    displayName: 'Scatters',
    icon: 'scatterplot',
    isExact: true,
    title: pageTitlesEnum.SCATTERS_EXPLORER,
  },
  SCATTERS_EXPLORE_ID: {
    path: PathEnum.Scatters_Id,
    component: Scatters,
    showInSidebar: false,
    displayName: 'ScatterId',
    isExact: true,
    title: pageTitlesEnum.SCATTERS_EXPLORER,
  },
  BOOKMARKS: {
    path: PathEnum.Bookmarks,
    component: Bookmarks,
    showInSidebar: true,
    displayName: 'Bookmarks',
    icon: 'bookmarks',
    isExact: true,
    title: pageTitlesEnum.BOOKMARKS,
  },
  TAGS: {
    path: PathEnum.Tags,
    component: TagsContainer,
    showInSidebar: true,
    displayName: 'Tags',
    icon: 'tags',
    isExact: true,
    title: pageTitlesEnum.TAGS,
  },
  RUN_DETAIL: {
    path: PathEnum.Run_Detail,
    component: RunDetail,
    showInSidebar: false,
    displayName: 'Run Detail',
    isExact: false,
    title: pageTitlesEnum.RUN_DETAIL,
  },
  Experiment: {
    path: PathEnum.Experiment,
    component: Experiment,
    showInSidebar: false,
    displayName: 'Experiment',
    isExact: false,
    title: pageTitlesEnum.EXPERIMENT,
  },
  METRICS_EXPLORER: {
    path: PathEnum.Metrics_Explorer,
    component: MetricsExplorer,
    showInSidebar: false,
    icon: 'metrics',
    displayName: 'Metrics_v2',
    isExact: true,
    title: pageTitlesEnum.METRICS_EXPLORER_V2,
  },
  REPORTS: {
    path: PathEnum.Reports,
    component: Reports,
    showInSidebar: true,
    displayName: 'Reports',
    icon: 'reports',
    isExact: true,
    title: pageTitlesEnum.REPORTS,
  },
  REPORT: {
    path: PathEnum.Report,
    component: Report,
    showInSidebar: false,
    displayName: 'Report',
    isExact: true,
    title: pageTitlesEnum.REPORT,
  },
  REPORT_EDIT: {
    path: PathEnum.Report_Edit,
    component: Report,
    showInSidebar: false,
    displayName: 'Report',
    isExact: true,
    title: pageTitlesEnum.REPORT,
  },
};

export default routes;
