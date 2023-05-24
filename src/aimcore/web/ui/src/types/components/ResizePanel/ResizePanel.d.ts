import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IResizePanelProps {
  panelResizing: boolean;
  resizeElemRef: IMetricProps['resizeElemRef'];
  resizeMode: IMetricProps['resizeMode'];
  onTableResizeModeChange: IMetricProps['onTableResizeModeChange'];
  className?: string;
}
