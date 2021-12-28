import {
  AUDIO_FIXED_HEIGHT,
  ITEM_CAPTION_HEIGHT,
  ITEM_WRAPPER_HEIGHT,
} from 'config/mediaConfigs/mediaConfigs';

export default function getAudioMediaSetSize() {
  return AUDIO_FIXED_HEIGHT + ITEM_CAPTION_HEIGHT + ITEM_WRAPPER_HEIGHT;
}
