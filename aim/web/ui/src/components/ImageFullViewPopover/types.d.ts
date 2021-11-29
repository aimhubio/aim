import { IImageData } from 'types/services/models/imagesExplore/imagesExploreAppModel';

export interface IImageFullViewPopoverProps {
  imageData: IImageData;
  imagesBlobs: any;
  tooltipContent: ITooltipContent;
  handleClose: () => void;
}
