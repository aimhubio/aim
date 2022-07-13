import {
  ITooltip,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';
import { ITrendlineOptions } from 'types/services/models/scatter/scatterAppModel';
import { IScattersProps } from 'types/pages/scatters/Scatters';

import { ChartTypeEnum } from 'utils/d3';

export interface IControlProps {
  chartProps: any[];
  chartType: ChartTypeEnum;
  data: IScattersProps['scatterPlotData'];
  selectOptions: IGroupingSelectOption[];
  tooltip?: ITooltip;
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
  onChangeTooltip: (tooltip: Partial<ITooltip>) => void;
  trendlineOptions: ITrendlineOptions;
  onChangeTrendlineOptions: (options: Partial<ITrendlineOptions>) => void;
}
