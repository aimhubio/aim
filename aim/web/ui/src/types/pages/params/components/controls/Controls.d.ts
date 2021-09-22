import { CurveEnum } from 'utils/d3';
import {
  IChartTooltip,
  IGroupingSelectOption,
} from '/types/services/models/metrics/metricsAppModel';

export interface IControlProps {
  curveInterpolation: CurveEnum;
  isVisibleColorIndicator: boolean;
  selectOptions: IGroupingSelectOption[];
  tooltip: IChartTooltip;
  onColorIndicatorChange: () => void;
  onCurveInterpolationChange: () => void;
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
}
