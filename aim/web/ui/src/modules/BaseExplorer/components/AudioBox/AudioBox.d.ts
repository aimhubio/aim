export interface IAudioBoxProgressProps {
  audio: HTMLAudioElement;
  isPlaying: boolean;
  src: string;
  disabled?: boolean;
}

export interface IAudioBoxVolumeProps {
  audio: HTMLAudioElement;
}
