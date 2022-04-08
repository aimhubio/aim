import { ResizeModeEnum } from 'config/enums/tableEnums';

export const TABLE_COLUMN_START_COLOR_SCALE = '#F8EF42';
export const TABLE_COLUMN_END_COLOR_SCALE = '#0FD64F';

export enum RowHeightSize {
  sm = 28,
  md = 32,
  lg = 36,
}

export const ROW_CELL_SIZE_CONFIG = {
  28: {
    groupMargin: 4,
    name: 'small',
  },
  32: {
    groupMargin: 6,
    name: 'medium',
  },
  36: {
    groupMargin: 8,
    name: 'large',
  },
};

export const COLORED_SELECTION_COLUMN_WIDTH = 50;
export const SELECTION_COLUMN_WIDTH = 32;

export const VIEW_PORT_OFFSET = 500;

export const TABLE_DEFAULT_CONFIG = {
  runs: {
    resizeMode: ResizeModeEnum.Resizable,
    rowHeight: RowHeightSize.md,
    sortFields: [],
    hideSystemMetrics: true,
    hiddenMetrics: [],
    hiddenColumns: [],
    columnsWidths: {},
    columnsOrder: {
      left: ['run'],
      middle: [],
      right: [],
    },
    height: '0.5',
  },
  metrics: {
    resizeMode: ResizeModeEnum.Resizable,
    rowHeight: RowHeightSize.md,
    sortFields: [],
    hiddenMetrics: [],
    hiddenColumns: [],
    columnsWidths: {},
    columnsOrder: {
      left: ['run'],
      middle: [],
      right: [],
    },
    height: '0.5',
  },
  params: {
    resizeMode: ResizeModeEnum.Resizable,
    rowHeight: RowHeightSize.md,
    sortFields: [],
    hiddenMetrics: [],
    hiddenColumns: [],
    hideSystemMetrics: true,
    columnsWidths: {},
    columnsOrder: {
      left: ['run'],
      middle: [],
      right: [],
    },
    height: '0.5',
  },
  images: {
    resizeMode: ResizeModeEnum.Resizable,
    rowHeight: RowHeightSize.md,
    sortFields: [],
    hiddenMetrics: [],
    hiddenColumns: [],
    columnsWidths: {},
    columnsOrder: {
      left: ['run'],
      middle: [],
      right: [],
    },
    height: '0.5',
  },
  scatters: {
    resizeMode: ResizeModeEnum.Resizable,
    rowHeight: RowHeightSize.md,
    sortFields: [],
    hiddenMetrics: [],
    hiddenColumns: [],
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
