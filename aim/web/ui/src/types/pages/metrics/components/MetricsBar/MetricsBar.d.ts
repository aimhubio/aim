import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IMetricsBarProps {
  onBookmarkCreate: IMetricProps['onBookmarkCreate'];
  onBookmarkUpdate: IMetricProps['onBookmarkUpdate'];
  onResetConfigData: IMetricProps['onResetConfigData'];
  liveUpdateConfig: { delay: number; enabled: boolean };
  onLiveUpdateConfigChange: (config: {
    delay?: number;
    enabled?: boolean;
  }) => void;
  title: string;
}
