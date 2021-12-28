import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';
import { ITEM_CAPTION_HEIGHT } from 'config/mediaConfigs/mediaConfigs';

import { IGetImageMediaListHeightProps } from 'types/utils/getImageMediaListHeight';

export default function getImageMediaListHeight({
  alignmentType,
  maxHeight,
  maxWidth,
  wrapperOffsetWidth,
  mediaItemSize,
  mediaItemHeight,
}: IGetImageMediaListHeightProps): number {
  if (alignmentType === MediaItemAlignmentEnum.Original) {
    return maxHeight + ITEM_CAPTION_HEIGHT;
  }
  if (alignmentType === MediaItemAlignmentEnum.Width) {
    let width = (wrapperOffsetWidth * mediaItemSize) / 100;
    return (maxHeight / maxWidth) * width + ITEM_CAPTION_HEIGHT;
  }
  return mediaItemHeight + ITEM_CAPTION_HEIGHT;
}
