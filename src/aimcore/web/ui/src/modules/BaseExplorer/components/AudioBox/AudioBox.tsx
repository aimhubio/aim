import React from 'react';
import { useAudioBlobURI } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary';
import AudioPlayer from 'components/kit_v2/AudioPlayer';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

function AudioBox(props: IBoxContentProps) {
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
  } = useAudioBlobURI({
    engine: { events: props.engine.events, blobURI: props.engine.blobURI },
    format: props.data.data.format,
    caption: props.data.data.caption,
    name: props.data.sequence.name,
    context: props.data.sequence.context,
    step: props.data.record.step,
    index: props.data.record.index,
    isFullView: props.isFullView,
    blobData: props.data.data.blobs.data,
  });

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default React.memo(AudioBox);
