import { CurveEnum } from 'utils/d3';

import {
  IPanelTooltip,
  IGroupingSelectOption,
} from '/types/services/models/metrics/metricsAppModel';

export interface IControlProps {
  curveInterpolation: CurveEnum;
  isVisibleColorIndicator: boolean;
  selectOptions: IGroupingSelectOption[];
  tooltip: IPanelTooltip;
  onColorIndicatorChange: () => void;
  onCurveInterpolationChange: () => void;
  onChangeTooltip: (tooltip: Partial<IPanelTooltip>) => void;
}
