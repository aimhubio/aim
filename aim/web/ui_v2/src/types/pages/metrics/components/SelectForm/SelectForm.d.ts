import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';

export interface ISelectFormProps {
  onMetricsSelectChange: IMetricAppConfig['onMetricsSelectChange'];
  selectedMetricsData: ISelectMetricsOption[];
}
export interface ISelectMetricsOption {
  label: string;
  group: string;
  color: string;
  value: {
    metric_name: string;
    context: object;
  };
}
