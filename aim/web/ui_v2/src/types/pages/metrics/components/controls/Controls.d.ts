import { IHandleSmoothing } from '../../Metrics';

export interface IControlProps {
  toggleDisplayOutliers: () => void;
  displayOutliers: boolean;
  toggleZoomMode: () => void;
  zoomMode: boolean;
  handleSmoothing: (props: IHandleSmoothing) => void;
}
