import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IAppBarProps {
  onBookmarkCreate: IMetricProps['onBookmarkCreate'];
  onBookmarkUpdate: IMetricProps['onBookmarkUpdate'];
  onResetConfigData: IMetricProps['onResetConfigData'];
}
