import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

import { IGetImageBoxSizeProps } from 'types/utils/getImageBoxSize';

export default function getImageBoxSize({
  data,
  index = 0,
  additionalProperties,
  wrapperOffsetWidth,
  wrapperOffsetHeight = 0,
}: IGetImageBoxSizeProps): { width: number; height: number } {
  let width;
  let height;
  if (additionalProperties?.alignmentType === MediaItemAlignmentEnum.Width) {
    width = (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100;
    height = (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100;
  } else if (
    additionalProperties?.alignmentType === MediaItemAlignmentEnum.Height &&
    data
  ) {
    height = (wrapperOffsetHeight * additionalProperties?.mediaItemSize) / 100;
    width = (height / data?.[index]?.height) * data?.[index]?.width || 100;
  } else {
    width = data?.[index]?.width;
    height = data?.[index]?.height || 100;
  }
  return { width, height };
}
