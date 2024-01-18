import { ResizeModeEnum, MetricsValueKeyEnum } from 'config/enums/tableEnums';

import { AppNameEnum } from 'services/models/explorer';

export const TABLE_COLUMN_START_COLOR_SCALE = '#F8EF42';
export const TABLE_COLUMN_END_COLOR_SCALE = '#0FD64F';

export enum RowHeightSize {
  sm = 22,
  md = 28,
  lg = 32,
}

export enum VisualizationElementEnum {
  LINE = 'line',
  POINT = 'point',
  IMAGE = 'image',
}

export const ROW_CELL_SIZE_CONFIG = {
  22: {
    groupMargin: 2,
    name: 'small',
  },
  28: {
    groupMargin: 4,
    name: 'medium',
  },
  32: {
    groupMargin: 6,
    name: 'large',
  },
};

export const COLORED_SELECTION_COLUMN_WIDTH = 50;
export const SELECTION_COLUMN_WIDTH = 32;

export const VIEW_PORT_OFFSET = 500;

export const TABLE_DEFAULT_CONFIG: Record<string, any> = {
  [AppNameEnum.RUNS]: {
    metricsValueKey: MetricsValueKeyEnum.LAST,
    resizeMode: ResizeModeEnum.Resizable,
    rowHeight: RowHeightSize.md,
    sortFields: [],
    hideSystemMetrics: true,
    hiddenMetrics: [],
    hiddenColumns: ['hash', 'description'],
    nonHidableColumns: new Set(['#', 'run']),
    columnsWidths: {},
    columnsOrder: {
      left: ['run'],
      middle: [],
      right: [],
    },
    height: '0.5',
  },
  [AppNameEnum.METRICS]: {
    metricsValueKey: MetricsValueKeyEnum.LAST,
    resizeMode: ResizeModeEnum.Resizable,
    rowHeight: RowHeightSize.md,
    sortFields: [],
    hiddenMetrics: [],
    hiddenColumns: ['hash', 'description'],
    nonHidableColumns: new Set(['#', 'run', 'actions']),
    columnsWidths: {},
    columnsOrder: {
      left: ['run'],
      middle: [],
      right: [],
    },
    height: '0.5',
  },
  [AppNameEnum.PARAMS]: {
    metricsValueKey: MetricsValueKeyEnum.LAST,
    resizeMode: ResizeModeEnum.Resizable,
    rowHeight: RowHeightSize.md,
    sortFields: [],
    hiddenMetrics: [],
    hiddenColumns: ['hash', 'description'],
    nonHidableColumns: new Set(['#', 'run', 'actions']),
    hideSystemMetrics: true,
    columnsWidths: {},
    columnsOrder: {
      left: ['run'],
      middle: [],
      right: [],
    },
    height: '0.5',
  },
  [AppNameEnum.IMAGES]: {
    metricsValueKey: MetricsValueKeyEnum.LAST,
    resizeMode: ResizeModeEnum.Resizable,
    rowHeight: RowHeightSize.md,
    sortFields: [],
    hiddenMetrics: [],
    hiddenColumns: ['hash', 'description'],
    nonHidableColumns: new Set(['#', 'run', 'actions']),
    columnsWidths: {},
    columnsOrder: {
      left: ['run'],
      middle: [],
      right: [],
    },
    height: '0.5',
  },
  [AppNameEnum.SCATTERS]: {
    metricsValueKey: MetricsValueKeyEnum.LAST,
    resizeMode: ResizeModeEnum.Resizable,
    rowHeight: RowHeightSize.md,
    sortFields: [],
    hiddenMetrics: [],
    hiddenColumns: ['hash', 'description'],
    nonHidableColumns: new Set(['#', 'run', 'actions']),
    hideSystemMetrics: true,
    columnsWidths: {},
    columnsOrder: {
      left: ['run'],
      middle: [],
      right: [],
    },
    height: '0.5',
  },
};

export const AVOID_COLUMNS_TO_HIDE_LIST = new Set([
  'metric',
  'experiment',
  'date',
  'duration',
  'name',
  'context',
]);

export const EXPLORE_SELECTED_RUNS_CONFIG: Record<string, AppNameEnum[]> = {
  [AppNameEnum.RUNS]: [
    AppNameEnum.RUNS,
    AppNameEnum.METRICS,
    AppNameEnum.IMAGES,
    AppNameEnum.FIGURES,
    AppNameEnum.AUDIOS,
    AppNameEnum.TEXT,
  ],
  [AppNameEnum.METRICS]: [
    AppNameEnum.RUNS,
    AppNameEnum.METRICS,
    AppNameEnum.IMAGES,
    AppNameEnum.FIGURES,
    AppNameEnum.AUDIOS,
    AppNameEnum.TEXT,
  ],
  [AppNameEnum.PARAMS]: [
    AppNameEnum.RUNS,
    AppNameEnum.METRICS,
    AppNameEnum.IMAGES,
    AppNameEnum.FIGURES,
    AppNameEnum.AUDIOS,
    AppNameEnum.TEXT,
  ],
  [AppNameEnum.SCATTERS]: [
    AppNameEnum.RUNS,
    AppNameEnum.METRICS,
    AppNameEnum.IMAGES,
    AppNameEnum.FIGURES,
    AppNameEnum.AUDIOS,
    AppNameEnum.TEXT,
  ],
  [AppNameEnum.IMAGES]: [
    AppNameEnum.RUNS,
    AppNameEnum.METRICS,
    AppNameEnum.IMAGES,
    AppNameEnum.FIGURES,
    AppNameEnum.AUDIOS,
    AppNameEnum.TEXT,
  ],
  dashboard: [
    AppNameEnum.RUNS,
    AppNameEnum.METRICS,
    AppNameEnum.IMAGES,
    AppNameEnum.FIGURES,
    AppNameEnum.AUDIOS,
    AppNameEnum.TEXT,
  ],
  experiment: [
    AppNameEnum.RUNS,
    AppNameEnum.METRICS,
    AppNameEnum.IMAGES,
    AppNameEnum.FIGURES,
    AppNameEnum.AUDIOS,
    AppNameEnum.TEXT,
  ],
  run: [
    AppNameEnum.RUNS,
    AppNameEnum.METRICS,
    AppNameEnum.IMAGES,
    AppNameEnum.FIGURES,
    AppNameEnum.AUDIOS,
    AppNameEnum.TEXT,
  ],
};
