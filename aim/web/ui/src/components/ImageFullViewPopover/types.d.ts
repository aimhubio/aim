import { IImageData } from 'types/services/models/imagesExplore/imagesExploreAppModel';

export interface IImageFullViewPopoverProps {
  imageData: IImageData;
  tooltipContent: ITooltipContent;
  handleClose: () => void;
  imageRendering: string;
}
