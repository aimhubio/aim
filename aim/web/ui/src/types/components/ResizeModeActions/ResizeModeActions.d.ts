import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IResizeModeActions {
  onTableResizeModeChange: IMetricProps['onTableResizeModeChange'];
  resizeMode: IMetricProps['resizeMode'];
  className?: string;
}
