import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

export interface IGetImageMediaSetSizeProps {
  maxHeight: number;
  maxWidth: number;
  mediaItemHeight: number;
  alignmentType: MediaItemAlignmentEnum;
  wrapperOffsetWidth: number;
  mediaItemSize: number;
  stacking: boolean;
}
