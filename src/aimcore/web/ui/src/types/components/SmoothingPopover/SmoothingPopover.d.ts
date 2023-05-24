import { ISmoothing } from 'types/services/models/metrics/metricsAppModel';

export interface ISmoothingPopoverProps {
  onSmoothingChange: (props: Partial<ISmoothing>) => void;
  smoothing: ISmoothing;
}
