import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';
import { IMetricProps } from '../../Metrics';

export interface IGroupingProps {
  groupingData: IMetricAppConfig['grouping'];
  groupingSelectOptions: IMetricProps['groupingSelectOptions'];
  onGroupingSelectChange: IMetricProps['onGroupingSelectChange'];
  onGroupingModeChange: IMetricProps['onGroupingModeChange']
  onGroupingPaletteChange: IMetricProps['onGroupingPaletteChange']
}
