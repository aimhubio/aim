import React from 'react';
import { useAudioBlobURI } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary';
import AudioPlayer from 'components/AudioPlayer';

import { AudioBoxProps } from './';

function AudioBox(
  props: AudioBoxProps,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    audioRef,
    mediaState,
    setIsPlaying,
    setProcessing,
    onPlay,
    onPause,
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
          src={mediaState.src}
          onEnded={() => setIsPlaying(false)}
          onCanPlay={() => setProcessing(false)}
          onPlay={onPlay}
          onPause={onPause}
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
