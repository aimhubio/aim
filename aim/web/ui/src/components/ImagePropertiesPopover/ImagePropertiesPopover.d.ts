import { IControlProps } from 'types/pages/imagesExplore/components/Controls/Controls';

export interface IImagePropertiesPopoverProps {
  imageProperties: IControlProps['imageProperties'];
  onImageSizeChange: IControlProps['onImageSizeChange'];
  onImageRenderingChange: IControlProps['onImageRenderingChange'];
  onImageAlignmentChange: IControlProps['onImageAlignmentChange'];
}
