import { IImageData } from 'types/services/models/imagesExplore/imagesExploreAppModel';

export interface IImageFullViewPopoverProps {
  imageData: IImageData;
  imagesBlobs: { [key: string]: string };
  tooltipContent: ITooltipContent;
  handleClose: () => void;
}
