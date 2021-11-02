import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';

import { CurveEnum } from 'utils/d3';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';

export interface ISmoothingPopoverProps {
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  smoothingAlgorithm: SmoothingAlgorithmEnum;
  smoothingFactor: number;
  curveInterpolation: CurveEnum;
}
