import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';

export interface ISelectFormProps {
  selectedMetricsData: IMetricAppConfig['select'];
  onMetricsSelectChange: (metrics: ISelectMetricsOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onSearchQueryCopy: () => void;
}
export interface ISelectMetricsOption {
  label: string;
  group: string;
  color: string;
  value: {
    metric_name: string;
    context: { [key: string]: unknown } | null | any;
  };
}
