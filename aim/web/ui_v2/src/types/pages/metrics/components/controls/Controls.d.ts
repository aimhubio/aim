import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IOnSmoothingChange } from '../../Metrics';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';

export interface IControlProps {
  onDisplayOutliersChange: () => void;
  displayOutliers: boolean;
  onZoomModeChange: () => void;
  zoomMode: boolean;
  highlightMode: HighlightEnum;
  onChangeHighlightMode: (mode: number) => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  axesScaleType: IAxesScaleState;
}
