import { IControlProps } from 'types/pages/imagesExplore/components/Controls/Controls';

export interface IImagePropertiesPopoverProps {
  additionalProperties: IControlProps['additionalProperties'];
  onImageSizeChange: IControlProps['onImageSizeChange'];
  onImageRenderingChange: IControlProps['onImageRenderingChange'];
  onImageAlignmentChange: IControlProps['onImageAlignmentChange'];
}
