import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';

export interface ISelectFormProps {
  onMetricsSelectChange: IMetricAppConfig['onMetricsSelectChange'];
  selectedMetricsData: ISelectMetricsOption[];
}
export interface ISelectMetricsOption {
  name: string;
  group: string;
  color: string;
}
