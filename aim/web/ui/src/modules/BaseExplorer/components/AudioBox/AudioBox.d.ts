import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface IAudioBoxProps {
  data: any;
  engine: IBaseComponentProps['engine'];
}

export interface IAudioBoxProgressProps {
  audio: HTMLAudioElement;
  isPlaying: boolean;
  src: string;
}

export interface IAudioBoxVolumeProps {
  audio: HTMLAudioElement;
}
