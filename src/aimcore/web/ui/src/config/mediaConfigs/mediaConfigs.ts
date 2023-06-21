import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

import { IGetImageBoxSizeProps } from 'types/utils/getImageBoxSize';
import { IGetImageMediaListHeightProps } from 'types/utils/getImageMediaListHeight';
import { IGetImageMediaSetSizeProps } from 'types/utils/getImageMediaSetSize';

export enum MediaTypeEnum {
  IMAGE = 'image',
  AUDIO = 'audio',
}

export const IMAGE_FIXED_HEIGHT = 110;
export const ITEM_WRAPPER_HEIGHT = 33;
export const ITEM_CAPTION_HEIGHT = 40;
export const MEDIA_SET_TITLE_HEIGHT = 17;
export const MEDIA_SET_WRAPPER_PADDING_HEIGHT = 6;
export const MEDIA_SET_SLIDER_HEIGHT = 20;
export const BATCH_COLLECT_DELAY = 200;
export const BATCH_SEND_DELAY = 300;
export const IMAGE_SIZE_CHANGE_DELAY = 200;
export const AUDIO_FIXED_WIDTH = 276;
export const AUDIO_FIXED_HEIGHT = 40;
export const SPACE_BETWEEN_ITEMS = 6;

export const IMAGES_SLIDER_PROPS = {
  step: 1,
  min: 15,
  max: 70,
};

function getAudioBoxSize(): { width: number; height: number } {
  return { width: AUDIO_FIXED_WIDTH, height: AUDIO_FIXED_HEIGHT };
}

function getImageBoxSize({
  data,
  index = 0,
  additionalProperties,
  wrapperOffsetWidth,
  wrapperOffsetHeight = 0,
}: IGetImageBoxSizeProps): { width: number; height: number } {
  let width;
  let height;
  if (additionalProperties?.alignmentType === MediaItemAlignmentEnum.Width) {
    width =
      (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100 +
      SPACE_BETWEEN_ITEMS;
    height = (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100;
  } else if (
    additionalProperties?.alignmentType === MediaItemAlignmentEnum.Height &&
    data
  ) {
    height = (wrapperOffsetHeight * additionalProperties?.mediaItemSize) / 100;
    width =
      (height / data?.[index]?.height) * data?.[index]?.width +
        SPACE_BETWEEN_ITEMS || 100;
  } else {
    width = data?.[index]?.width + SPACE_BETWEEN_ITEMS;
    height = data?.[index]?.height || 100;
  }
  return { width, height };
}

function getAudioMediaListHeight(mediaItemHeight: number): number {
  return mediaItemHeight + ITEM_CAPTION_HEIGHT;
}

function getAudioMediaSetSize() {
  return AUDIO_FIXED_HEIGHT + ITEM_CAPTION_HEIGHT + ITEM_WRAPPER_HEIGHT;
}

function getImageMediaListHeight({
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

function getImageMediaSetSize({
  maxHeight,
  maxWidth,
  mediaItemHeight,
  alignmentType,
  wrapperOffsetWidth,
  mediaItemSize,
  stacking,
}: IGetImageMediaSetSizeProps) {
  let height;
  if (alignmentType === MediaItemAlignmentEnum.Original) {
    height = maxHeight;
  } else if (alignmentType === MediaItemAlignmentEnum.Width) {
    let width = (wrapperOffsetWidth * mediaItemSize) / 100;
    height = (maxHeight / maxWidth) * width;
  } else {
    height = mediaItemHeight;
  }
  return (
    height +
    ITEM_WRAPPER_HEIGHT +
    ITEM_CAPTION_HEIGHT +
    (stacking ? MEDIA_SET_SLIDER_HEIGHT : 0)
  );
}

export const IMAGE_ALIGNMENT_OPTIONS = [
  { label: 'Original Size', value: MediaItemAlignmentEnum.Original },
  { label: 'Width', value: MediaItemAlignmentEnum.Width },
  { label: 'Height', value: MediaItemAlignmentEnum.Height },
];

export const MEDIA_ITEMS_SIZES = {
  [MediaTypeEnum.AUDIO]: getAudioBoxSize,
  [MediaTypeEnum.IMAGE]: getImageBoxSize,
};

export const MEDIA_SET_SIZE = {
  [MediaTypeEnum.AUDIO]: getAudioMediaSetSize,
  [MediaTypeEnum.IMAGE]: getImageMediaSetSize,
};

export const MEDIA_LIST_HEIGHT = {
  [MediaTypeEnum.AUDIO]: getAudioMediaListHeight,
  [MediaTypeEnum.IMAGE]: getImageMediaListHeight,
};
