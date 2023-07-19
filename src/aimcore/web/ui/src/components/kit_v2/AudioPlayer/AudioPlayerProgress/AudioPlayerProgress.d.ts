export interface AudioPlayerProgressProps {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  src: string;
  disabled?: boolean;
}
