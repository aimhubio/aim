import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';
import { IMetricProps } from '../../Metrics';

export interface IGroupingProps {
  grouping: IMetricAppConfig['grouping'];
  groupingSelectOptions: IMetricProps['groupingSelectOptions'];
  onGroupingSelectChange: IMetricProps['onGroupingSelectChange'];
}
