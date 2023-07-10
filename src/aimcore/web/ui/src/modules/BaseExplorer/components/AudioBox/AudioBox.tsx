import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary';
import AudioPlayer from 'components/AudioPlayer';

import { BATCH_COLLECT_DELAY } from 'config/mediaConfigs/mediaConfigs';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

import contextToString from 'utils/contextToString';
import { downloadLink } from 'utils/helper';

const EVENTS = {
  onAudioPlay: 'onAudioPlay',
};

function AudioBox(props: IBoxContentProps) {
  const {
    engine: { events, blobURI },
    data: {
      data: { blobs, format, caption },
      sequence,
      record,
    },
    isFullView,
  } = props;

  const blob_uri = blobs.data;
  const initialBlobData = blobURI.getBlobData(blob_uri);
  const initialSrc =
    initialBlobData && format
      ? `data:audio/${format};base64,${initialBlobData}`
      : '';

  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [processing, setProcessing] = React.useState<boolean>(false);
  const [mediaState, setMediaState] = React.useState({
    blobData: initialBlobData,
    src: initialSrc,
  });
  const audioRef = React.useRef<HTMLMediaElement | null>(null);
  const readyToPlayRef = React.useRef<boolean>(false);

  function onPlay() {
    if (audioRef.current && mediaState.src) {
      readyToPlayRef.current = true;
      events.fire(EVENTS.onAudioPlay, { blob_uri, isFullView });
      setIsPlaying(true);
    } else {
      setProcessing(true);

      blobURI
        .getBlobsData([blob_uri])
        .call()
        .then(() => {
          readyToPlayRef.current = true;
          events.fire(EVENTS.onAudioPlay, { blob_uri, isFullView });
          setIsPlaying(true);
        });
    }
  }

  function onPause() {
    setIsPlaying(false);
  }

  function onDownload(): void {
    if (audioRef.current && mediaState.src) {
      handleDownload();
    } else {
      setProcessing(true);
      blobURI
        .getBlobsData([blob_uri])
        .call()
        .then(() => {
          const blobData = blobURI.getBlobData(blob_uri);
          const newSrc = `data:audio/${format};base64,${blobData}`;
          setMediaState({ blobData, src: newSrc });
          handleDownload(newSrc);
        });
    }
  }

  function handleDownload(mediaSrc: string = mediaState.src): void {
    const { step, index } = record;
    const { context, name: audio_name } = sequence;
    const strContext = contextToString(context);
    const contextName = strContext === '' ? '' : `_${strContext}`;
    const name = `${audio_name}${contextName}_${caption}_${step}_${index}`;
    downloadLink(mediaSrc, name);
  }

  React.useEffect(() => {
    if (audioRef.current && mediaState.src) {
      if (isPlaying) {
        audioRef.current.muted = false;
        // eslint-disable-next-line no-console
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, mediaState.src]);

  React.useEffect(() => {
    const unsubscribe = events.on(
      EVENTS.onAudioPlay,
      (p: { blob_uri: string; isFullView: boolean }) => {
        if (p.blob_uri !== blob_uri || p.isFullView !== isFullView) {
          setIsPlaying(false);
        }
      },
    );
    return () => {
      unsubscribe();
    };
  }, [blob_uri, events, isFullView]);

  React.useEffect(() => {
    let timeoutID: number;
    let unsubscribe: () => void;

    const setBlobDataAndSrc = (blobData: string, format: string) => {
      setMediaState({
        blobData,
        src: `data:audio/${format};base64,${blobData}`,
      });
    };

    if (processing && mediaState.blobData === null) {
      const currentBlobData = blobURI.getBlobData(blob_uri);
      if (currentBlobData) {
        setBlobDataAndSrc(currentBlobData, format);
      } else {
        unsubscribe = blobURI.on(blob_uri, (blobData: string) => {
          setBlobDataAndSrc(blobData, format);
          unsubscribe();
        });
        timeoutID = window.setTimeout(() => {
          const currentBlobData = blobURI.getBlobData(blob_uri);
          if (currentBlobData) {
            setBlobDataAndSrc(currentBlobData, format);
            unsubscribe();
          } else {
            // addUriToList(blob_uri);
          }
        }, BATCH_COLLECT_DELAY);
      }
    }

    return () => {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [mediaState.blobData, blobURI, blob_uri, format, processing]);

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      readyToPlayRef.current = false;
    };
  }, []);

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
        readyToPlay={readyToPlayRef.current}
        caption={caption}
      />
    </ErrorBoundary>
  );
}

export default React.memo(AudioBox);
