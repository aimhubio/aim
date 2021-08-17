import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';
import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IGroupingProps {
  groupingData: IMetricAppConfig['grouping'];
  onGroupingSelectChange: IMetricProps['onGroupingSelectChange'];
  onGroupingModeChange: IMetricProps['onGroupingModeChange'];
  onGroupingPaletteChange: IMetricProps['onGroupingPaletteChange'];
  onGroupingReset: IMetricProps['onGroupingReset'];
  onGroupingApplyChange: IMetricAppConfig['onGroupingApplyChange'];
  onGroupingPersistenceChange: IMetricProps['onGroupingPersistenceChange'];
}
