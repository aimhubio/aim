import React from 'react';

export interface AudioPlayerProps extends React.HTMLProps<HTMLAudioElement> {
  audioRef: React.MutableRefObject<HTMLMediaElement>;
  src: string;
  isPlaying: boolean;
  processing: boolean;
  onDownload?: () => void;
  caption?: string;
  readyToPlay: boolean;
  onEnded: () => void;
  onCanPlay: () => void;
  onPlay: () => void;
  onPause: () => void;
}
