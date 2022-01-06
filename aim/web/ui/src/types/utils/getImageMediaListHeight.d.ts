import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

export interface IGetImageMediaListHeightProps {
  alignmentType: MediaItemAlignmentEnum;
  maxHeight: number;
  maxWidth: number;
  wrapperOffsetWidth: number;
  mediaItemSize: number;
  mediaItemHeight: number;
}
