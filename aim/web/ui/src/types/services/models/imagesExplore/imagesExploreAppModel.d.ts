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
    recordSlice?: number[];
    indexSlice?: number[];
    stepRange?: number[];
    indexRange?: number[];
    recordDensity?: number;
    indexDensity?: number;
    calcRanges: boolean;
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
