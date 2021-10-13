export interface IImagesExploreAppConfig {
  grouping: {
    groupBy: [];
    reverseMode: {
      groupBy: boolean;
    };
    isApplied: {
      groupBy: boolean;
    };
  };
  images: {
    stepSlice: number[];
    indexSlice: number[];
  };
  select: {
    metrics: ISelectMetricsOption[];
    query: string;
    advancedMode: boolean;
    advancedQuery: string;
  };
  table: {
    resizeMode: ResizeModeEnum;
    rowHeight: RowHeightSize;
    sortFields?: SortField[];
    hiddenMetrics?: string[];
    hiddenColumns?: string[];
    columnsWidths?: { [key: string]: number };
    columnsOrder?: {
      left: string[];
      middle: string[];
      right: string[];
    };
    height: string;
  };
}
