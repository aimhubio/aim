import React from 'react';
import { useAudioBlobURI } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary';
import { AudioPlayer } from 'components/kit_v2';

import { AudioBoxProps } from './';
function AudioBox(props: AudioBoxProps) {
  const {
    audioRef,
    data,
    setIsPlaying,
    setProcessing,
    onPlay,
    onDownload,
    processing,
    isPlaying,
    readyToPlay,
    caption,
  } = useAudioBlobURI(props);

  return (
    <ErrorBoundary>
      <div style={props.style}>
        <AudioPlayer
          audioRef={audioRef}
          src={data.src}
          onEnded={() => setIsPlaying(false)}
          onCanPlay={() => setProcessing(false)}
          onPlay={onPlay}
          onPause={() => setIsPlaying(false)}
          onDownload={onDownload}
          processing={processing}
          isPlaying={isPlaying}
          readyToPlay={readyToPlay}
          caption={caption}
        />
      </div>
    </ErrorBoundary>
  );
}

export default AudioBox;
