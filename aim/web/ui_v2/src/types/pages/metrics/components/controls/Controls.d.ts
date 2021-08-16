import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IOnSmoothingChange } from 'Metrics';
import { CurveEnum } from 'utils/d3';
import { IAggregation } from 'types/services/models/metrics/metricsAppModel';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

export interface IControlProps {
  onDisplayOutliersChange: () => void;
  displayOutliers: boolean;
  onZoomModeChange: () => void;
  zoomMode: boolean;
  highlightMode: HighlightEnum;
  aggregation: IAggregation;
  onHighlightModeChange: (mode: number) => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  onAggregationChange: (aggregation: Partial<IAggregation>) => void;
  axesScaleType: IAxesScaleState;
  smoothingAlgorithm: SmoothingAlgorithmEnum;
  smoothingFactor: number;
  curveInterpolation: CurveEnum;
}
