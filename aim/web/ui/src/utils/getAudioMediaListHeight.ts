import { ITEM_CAPTION_HEIGHT } from 'config/mediaConfigs/mediaConfigs';

export default function getAudioMediaListHeight(
  mediaItemHeight: number,
): number {
  return mediaItemHeight + ITEM_CAPTION_HEIGHT;
}
