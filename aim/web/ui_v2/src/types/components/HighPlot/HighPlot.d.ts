import { CurveEnum } from 'utils/d3';

import { ISyncHoverStateParams } from 'types/utils/d3/drawHoverAttributes';

export interface IHighPlotProps {
  index: number;
  curveInterpolation: CurveEnum;
  syncHoverState: (params: ISyncHoverStateParams | null) => void;
  data: any;
}
