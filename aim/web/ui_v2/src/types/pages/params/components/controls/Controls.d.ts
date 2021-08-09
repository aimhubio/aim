import { CurveEnum } from 'utils/d3';

export interface IControlProps {
  onCurveInterpolationChange: () => void;
  curveInterpolation: CurveEnum;
  isVisibleColorIndicator: boolean;
  onColorIndicatorChange: () => void;
}
