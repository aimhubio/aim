import { MediaTypeEnum } from 'components/MediaPanel/config';

import getAudioBoxSize from 'utils/getAudioBoxSize';
import getImageBoxSize from 'utils/getImageBoxSize';

export const IMAGE_FIXED_HEIGHT = 110;
export const ITEM_WRAPPER_HEIGHT = 33;
export const ITEM_CAPTION_HEIGHT = 16;
export const MEDIA_SET_TITLE_HEIGHT = 17;
export const MEDIA_SET_WRAPPER_PADDING_HEIGHT = 6;
export const BATCH_COLLECT_DELAY = 200;
export const BATCH_SEND_DELAY = 300;
export const IMAGE_SIZE_CHANGE_DELAY = 200;
export const AUDIO_FIXED_WIDTH = 276;
export const AUDIO_FIXED_HEIGHT = 40;

export const MEDIA_ITEMS_SIZES = {
  [MediaTypeEnum.AUDIO]: getAudioBoxSize,
  [MediaTypeEnum.IMAGE]: getImageBoxSize,
};
