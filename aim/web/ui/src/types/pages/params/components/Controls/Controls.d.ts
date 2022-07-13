import {
  IGroupingSelectOption,
  ITooltip,
} from 'types/services/models/metrics/metricsAppModel';

import { CurveEnum } from 'utils/d3';

export interface IControlProps {
  curveInterpolation: CurveEnum;
  isVisibleColorIndicator: boolean;
  selectOptions: IGroupingSelectOption[];
  tooltip?: ITooltip;
  onColorIndicatorChange: () => void;
  onCurveInterpolationChange: () => void;
  onChangeTooltip: (tooltip: Partial<ITooltip>) => void;
}
