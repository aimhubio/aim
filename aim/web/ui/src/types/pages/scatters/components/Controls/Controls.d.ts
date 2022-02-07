import {
  IChartTooltip,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';
import { ITrendlineOptions } from 'types/services/models/scatter/scatterAppModel';

export interface IControlProps {
  selectOptions: IGroupingSelectOption[];
  tooltip: IChartTooltip;
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
  trendlineOptions: ITrendlineOptions;
  onChangeTrendlineOptions: (options: Partial<ITrendlineOptions>) => void;
}
