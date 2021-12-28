import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';
import {
  ITEM_CAPTION_HEIGHT,
  ITEM_WRAPPER_HEIGHT,
} from 'config/mediaConfigs/mediaConfigs';

import { IGetImageMediaSetSizeProps } from 'types/utils/getImageMediaSetSize';

export default function getImageMediaSetSize({
  maxHeight,
  maxWidth,
  mediaItemHeight,
  alignmentType,
  wrapperOffsetWidth,
  mediaItemSize,
}: IGetImageMediaSetSizeProps) {
  if (alignmentType === MediaItemAlignmentEnum.Original) {
    return maxHeight + ITEM_WRAPPER_HEIGHT + ITEM_CAPTION_HEIGHT;
  }
  if (alignmentType === MediaItemAlignmentEnum.Width) {
    let width = (wrapperOffsetWidth * mediaItemSize) / 100;
    return (
      (maxHeight / maxWidth) * width + ITEM_CAPTION_HEIGHT + ITEM_WRAPPER_HEIGHT
    );
  }
  return mediaItemHeight + ITEM_CAPTION_HEIGHT + ITEM_WRAPPER_HEIGHT;
}
