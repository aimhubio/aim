import { IChartZoom } from 'types/services/models/metrics/metricsAppModel';

import { ZoomEnum } from 'utils/d3';

export interface IZoomInPopoverProps {
  mode?: ZoomEnum;
  onChange?: (zoom: Partial<IChartZoom>) => void;
}
