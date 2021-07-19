import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IOnSmoothingChange } from '../../Metrics';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';

export interface IControlProps {
  toggleDisplayOutliers: () => void;
  displayOutliers: boolean;
  toggleZoomMode: () => void;
  zoomMode: boolean;
  highlightMode: HighlightEnum;
  onChangeHighlightMode: (mode: HighlightEnum) => () => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  axesScaleType: IAxesScaleState;
}
