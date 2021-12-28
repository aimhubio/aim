import { MediaTypeEnum } from 'components/MediaPanel/config';

import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

import getAudioBoxSize from 'utils/getAudioBoxSize';
import getAudioMediaListHeight from 'utils/getAudioMediaListHeight';
import getAudioMediaSetSize from 'utils/getAudioMediaSetSize';
import getImageBoxSize from 'utils/getImageBoxSize';
import getImageMediaListHeight from 'utils/getImageMediaListHeight';
import getImageMediaSetSize from 'utils/getImageMediaSetSize';

export const IMAGE_FIXED_HEIGHT = 110;
export const ITEM_WRAPPER_HEIGHT = 33;
export const ITEM_CAPTION_HEIGHT = 20;
export const MEDIA_SET_TITLE_HEIGHT = 17;
export const MEDIA_SET_WRAPPER_PADDING_HEIGHT = 6;
export const BATCH_COLLECT_DELAY = 200;
export const BATCH_SEND_DELAY = 300;
export const IMAGE_SIZE_CHANGE_DELAY = 200;
export const AUDIO_FIXED_WIDTH = 276;
export const AUDIO_FIXED_HEIGHT = 40;

export const IMAGES_SLIDER_PROPS = {
  step: 1,
  min: 15,
  max: 70,
};

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
