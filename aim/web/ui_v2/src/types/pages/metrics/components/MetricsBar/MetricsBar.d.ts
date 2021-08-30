import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IMetricsBarProps {
  onBookmarkCreate: IMetricProps['onBookmarkCreate'];
  onBookmarkUpdate: IMetricProps['onBookmarkUpdate'];
  onResetConfigData: IMetricProps['onResetConfigData'];
}
