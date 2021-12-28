import {
  AUDIO_FIXED_HEIGHT,
  AUDIO_FIXED_WIDTH,
} from 'config/mediaConfigs/mediaConfigs';

export default function getAudioBoxSize(): { width: number; height: number } {
  return { width: AUDIO_FIXED_WIDTH, height: AUDIO_FIXED_HEIGHT };
}
