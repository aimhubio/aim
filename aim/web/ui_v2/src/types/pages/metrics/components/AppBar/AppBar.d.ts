import { IMetricProps } from '../../Metrics';

export interface IAppBarProps {
  onBookmarkCreate: IMetricProps['onBookmarkCreate'];
  onBookmarkUpdate: IMetricProps['onBookmarkUpdate'];
  onResetConfigData: IMetricProps['onResetConfigData'];
}
