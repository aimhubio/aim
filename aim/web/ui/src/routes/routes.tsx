import React from 'react';

import {
  IconChartDots,
  IconFileAnalytics,
  IconFlag3,
  IconLayout2,
  IconTable,
} from '@tabler/icons-react';

import { PathEnum } from 'config/enums/routesEnum';
import { ExplorersCatsEnum } from 'config/enums/explorersCatsEnum';
import pageTitlesEnum from 'config/pageTitles/pageTitles';

const Runs = React.lazy(
  () => import(/* webpackChunkName: "runs" */ 'pages/Runs/RunsContainer'),
);
const RunDetail = React.lazy(
  () => import(/* webpackChunkName: "run" */ 'pages/RunDetail/RunDetail'),
);
const Experiment = React.lazy(
  () =>
    import(/* webpackChunkName: "experiment" */ 'pages/Experiment/Experiment'),
);
const Metrics = React.lazy(
  () =>
    import(
      /* webpackChunkName: "metrics" */ 'pages/Explorers/Metrics/MetricsContainer'
    ),
);
const Params = React.lazy(
  () =>
    import(
      /* webpackChunkName: "params" */ 'pages/Explorers/Params/ParamsContainer'
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
      /* webpackChunkName: "scatters" */ 'pages/Explorers/Scatters/ScattersContainer'
    ),
);

const ImagesExplore = React.lazy(
  () =>
    import(
      /* webpackChunkName: "images" */ 'pages/Explorers/ImagesExplore/ImagesExplore'
    ),
);
const FiguresExplore = React.lazy(
  () =>
    import(/* webpackChunkName: "figures" */ 'pages/Explorers/FiguresExplorer'),
);
const AudiosExplorer = React.lazy(
  () =>
    import(/* webpackChunkName: "audios" */ 'pages/Explorers/AudiosExplorer'),
);

const MetricsExplorer = React.lazy(
  () =>
    import(
      /* webpackChunkName: "metrics_v2" */ 'pages/Explorers/MetricsExplorer'
    ),
);

const TextExplorer = React.lazy(
  () => import(/* webpackChunkName: "text" */ 'pages/Explorers/TextExplorer'),
);

const PromptsExplorer = React.lazy(
  () =>
    import(/* webpackChunkName: "text" */ 'pages/Explorers/PromptsExplorer'),
);

const Explorers = React.lazy(
  () => import(/* webpackChunkName: "explorers" */ 'pages/Explorers'),
);

const Bookmarks = React.lazy(
  () => import(/* webpackChunkName: "bookmarks" */ 'pages/Explorers/Bookmarks'),
);

const Boards = React.lazy(
  () => import(/* webpackChunkName: "boards" */ 'pages/Boards/Boards'),
);

const Board = React.lazy(
  () => import(/* webpackChunkName: "board" */ 'pages/Board/BoardContainer'),
);

const Reports = React.lazy(
  () => import(/* webpackChunkName: "reports" */ 'pages/Reports'),
);

const Report = React.lazy(
  () => import(/* webpackChunkName: "report" */ 'pages/Report/ReportContainer'),
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
  icon?: React.ReactNode | string | null;
  isExact?: boolean;
  title: string;
  color?: string;
  status?: RouteStatusEnum;
  description?: string;
  category?: string;
}

export enum RouteStatusEnum {
  NEW = 'new',
  COMING_SOON = 'coming-soon',
}

export const explorersRoutes: { [key: string]: IRoute } = {
  METRICS: {
    path: PathEnum.Metrics,
    component: Metrics,
    showInSidebar: false,
    displayName: 'Metrics',
    description:
      'Metrics Explorer allows to filter, group, aggregate tracked metrics.',
    icon: 'metrics',
    isExact: true,
    title: pageTitlesEnum.METRICS_EXPLORER,
    color: '$purple',
    category: ExplorersCatsEnum.Trainings,
  },
  PARAMS: {
    path: PathEnum.Params,
    component: Params,
    showInSidebar: false,
    displayName: 'Params',
    description:
      'Params Explorer helps to visualize tracked h-params and metrics results via parallel coordinates plot.',
    icon: 'params',
    isExact: true,
    title: pageTitlesEnum.PARAMS_EXPLORER,
    color: '$red',
    category: ExplorersCatsEnum.Trainings,
  },
  TEXT_EXPLORER: {
    path: PathEnum.Text_Explorer,
    component: TextExplorer,
    showInSidebar: false,
    icon: 'text',
    displayName: 'Text',
    description:
      'Text Explorer offers visualization of text inputs and outputs in NLP-related experiments.',
    isExact: true,
    title: pageTitlesEnum.TEXT_EXPLORER,
    color: '$pink',
    category: ExplorersCatsEnum.Trainings,
  },
  PROMPTS_EXPLORER: {
    path: PathEnum.Prompts_Explorer,
    component: PromptsExplorer,
    showInSidebar: false,
    icon: 'text',
    displayName: 'Prompts',
    description:
      'Prompts Explorer enables visualization of LLMs prompts and agents actions in AI systems execution.',
    isExact: true,
    title: pageTitlesEnum.PROMPTS_EXPLORER,
    color: '$primary',
    category: ExplorersCatsEnum.Prompts,
  },
  IMAGE_EXPLORE: {
    path: PathEnum.Images_Explore,
    component: ImagesExplore,
    showInSidebar: false,
    displayName: 'Images',
    description:
      'Images Explorer allows comparison of tracked images during training and evaluation.',
    icon: 'images',
    isExact: true,
    title: pageTitlesEnum.IMAGES_EXPLORER,
    color: '$orange',
    category: ExplorersCatsEnum.Trainings,
  },
  FIGURES_EXPLORER: {
    path: PathEnum.Figures_Explorer,
    component: FiguresExplore,
    showInSidebar: false,
    icon: 'figures',
    displayName: 'Figures',
    description:
      'Figures Explorer enables easy comparison of hundreds of Plotly figures.',
    isExact: true,
    title: pageTitlesEnum.FIGURES_EXPLORER,
    color: '$yellow',
    category: ExplorersCatsEnum.Trainings,
  },
  AUDIOS_EXPLORER: {
    path: PathEnum.Audios_Explorer,
    component: AudiosExplorer,
    showInSidebar: false,
    icon: 'audios',
    displayName: 'Audios',
    description:
      'Audio Explorer enables analysis of audio objects in speech-to-text or other speech-related tasks.',
    isExact: true,
    title: pageTitlesEnum.AUDIOS_EXPLORER,
    color: '$green',
    category: ExplorersCatsEnum.Trainings,
  },
  SCATTERS: {
    path: PathEnum.Scatters,
    component: Scatters,
    showInSidebar: false,
    displayName: 'Scatters',
    description:
      'Scatter Explorer visualizes correlations between metrics results and h-params.',
    icon: 'scatterplot',
    isExact: true,
    title: pageTitlesEnum.SCATTERS_EXPLORER,
    color: '$primary',
    category: ExplorersCatsEnum.Trainings,
  },
  METRICS_EXPLORER: {
    path: PathEnum.Metrics_Explorer,
    component: MetricsExplorer,
    showInSidebar: false,
    icon: 'metrics',
    displayName: 'Metrics [v2]',
    description:
      'Explore thousands of tracked metrics with Metrics Explorer v2.',
    isExact: true,
    title: pageTitlesEnum.METRICS_EXPLORER_V2,
    status: RouteStatusEnum.NEW,
    color: '$purple',
    category: ExplorersCatsEnum.Trainings,
  },
};

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
    icon: <IconTable color='#9D257F' />,
    isExact: true,
    title: pageTitlesEnum.RUNS_EXPLORER,
  },
  EXPLORERS: {
    path: PathEnum.Explorers,
    component: Explorers,
    showInSidebar: true,
    displayName: 'Explorers',
    icon: <IconChartDots color='#1473E6' />,
    isExact: true,
    title: pageTitlesEnum.EXPLORERS,
  },
  BOARDS: {
    path: PathEnum.Boards,
    component: Boards,
    showInSidebar: true,
    displayName: 'Boards',
    icon: <IconLayout2 color='#2A6218' />,
    isExact: true,
    title: pageTitlesEnum.BOARDS,
  },
  BOARD: {
    path: PathEnum.Board,
    component: Board,
    showInSidebar: false,
    displayName: 'Board',
    isExact: true,
    title: pageTitlesEnum.BOARD,
  },
  BOARD_EDIT: {
    path: PathEnum.Board_Edit,
    component: Board,
    showInSidebar: false,
    displayName: 'Board',
    isExact: true,
    title: pageTitlesEnum.BOARD,
  },
  REPORTS: {
    path: PathEnum.Reports,
    component: Reports,
    showInSidebar: true,
    displayName: 'Reports',
    icon: <IconFileAnalytics color='#5B329A' />,
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
  ...explorersRoutes,

  METRICS_ID: {
    path: PathEnum.Metrics_Id,
    component: Metrics,
    showInSidebar: false,
    displayName: 'MetricsId',
    isExact: true,
    title: pageTitlesEnum.METRICS_EXPLORER,
  },
  PARAMS_ID: {
    path: PathEnum.Params_Id,
    component: Params,
    showInSidebar: false,
    displayName: 'ParamsId',
    isExact: true,
    title: pageTitlesEnum.PARAMS_EXPLORER,
  },
  IMAGE_EXPLORE_ID: {
    path: PathEnum.Images_Explore_Id,
    component: ImagesExplore,
    showInSidebar: false,
    displayName: 'ImagesId',
    isExact: true,
    title: pageTitlesEnum.IMAGES_EXPLORER,
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
    showInSidebar: false,
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
    icon: <IconFlag3 color='#2A6218' />,
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
};

export default routes;
