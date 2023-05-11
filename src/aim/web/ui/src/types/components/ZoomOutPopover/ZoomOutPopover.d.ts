import { IChartZoom } from 'types/services/models/metrics/metricsAppModel';

export interface IZoomOutPopoverProps {
  zoomHistory?: IChartZoom['history'];
  onChange?: (zoom: Partial<IChartZoom>) => void;
}
