export interface ISelectFormProps {
  //   selectedMetricsData: IMetricAppConfig['select'];
  requestIsPending: boolean;
  selectedImagesData: any;
  onImagesExploreSelectChange: (metrics: ISelectMetricsOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onSearchQueryCopy: () => void;
  searchButtonDisabled: boolean;
}
export interface ISelectMetricsOption {
  label: string;
  group: string;
  color: string;
  value: {
    metric_name: string;
    context: object | null;
  };
}
