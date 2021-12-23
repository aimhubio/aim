import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

import { IGetImageBoxSizeProps } from 'types/utils/getImageBoxSize';

export default function getImageBoxSize({
  data,
  index,
  additionalProperties,
  wrapperOffsetWidth,
  mediaItemHeight,
}: IGetImageBoxSizeProps): number {
  if (additionalProperties?.alignmentType === MediaItemAlignmentEnum.Width) {
    return (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100;
  } else if (
    additionalProperties?.alignmentType === MediaItemAlignmentEnum.Height
  ) {
    return (mediaItemHeight / data[index].height) * data[index].width;
  } else {
    return data[index].width;
  }
}
