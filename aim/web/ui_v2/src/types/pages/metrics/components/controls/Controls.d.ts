export interface IControlProps {
  toggleDisplayOutliers: () => void;
  displayOutliers: boolean;
  toggleZoomMode: () => void;
  zoomMode: boolean;
  highlightMode: number;
  handleChangeHighlightMode: (mode: number) => () => void;
}
