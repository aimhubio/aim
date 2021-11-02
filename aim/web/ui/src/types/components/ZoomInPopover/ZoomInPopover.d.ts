import { ZoomEnum } from 'components/ZoomInPopover/ZoomInPopover';

import { IChartZoom } from 'types/services/models/metrics/metricsAppModel';

export interface IZoomInPopoverProps {
  mode?: ZoomEnum;
  onChange?: (zoom: Partial<IChartZoom>) => void;
}
