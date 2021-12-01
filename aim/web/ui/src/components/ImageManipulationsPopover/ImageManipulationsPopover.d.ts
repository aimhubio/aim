import { IControlProps } from 'types/pages/imagesExplore/components/Controls/Controls';

export interface IImageManipulationsPopoverProps {
  manipulations: IControlProps['manipulations'];
  onImageSizeChange: IControlProps['onImageSizeChange'];
  onImageRenderingChange: IControlProps['onImageRenderingChange'];
  onImageAlignmentChange: IControlProps['onImageAlignmentChange'];
}
