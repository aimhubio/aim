import {
  IGroupingSelectOption,
  IMetricAppConfig,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IGroupingProps {
  groupingData: IMetricAppConfig['grouping'];
  groupingSelectOptions: IGroupingSelectOption[];
  onGroupingSelectChange: IMetricProps['onGroupingSelectChange'];
  onGroupingModeChange: IMetricProps['onGroupingModeChange'];
  onGroupingPaletteChange: IMetricProps['onGroupingPaletteChange'];
  onGroupingReset: IMetricProps['onGroupingReset'];
  onGroupingApplyChange: IMetricAppConfig['onGroupingApplyChange'];
  onGroupingPersistenceChange: IMetricProps['onGroupingPersistenceChange'];
  singleGrouping?: boolean;
  onShuffleChange: IMetricProps['onShuffleChange'];
}
