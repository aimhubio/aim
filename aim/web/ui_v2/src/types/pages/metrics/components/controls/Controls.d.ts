import { IOnSmoothingChange } from '../../Metrics';

export interface IControlProps {
  toggleDisplayOutliers: () => void;
  displayOutliers: boolean;
  toggleZoomMode: () => void;
  zoomMode: boolean;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
}
