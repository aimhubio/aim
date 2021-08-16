import { CurveEnum } from 'utils/d3';

import { ISyncHoverStateParams } from 'types/utils/d3/drawHoverAttributes';

export interface IHighPlotProps {
  index: number;
  curveInterpolation: CurveEnum;
  isVisibleColorIndicator: boolean;
  syncHoverState: (params: ISyncHoverStateParams) => void;
  data: any;
}
