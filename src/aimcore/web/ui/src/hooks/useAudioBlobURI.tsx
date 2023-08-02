import React from 'react';

import { AudioBoxProps } from 'components/AudioBox';

import { BATCH_COLLECT_DELAY } from 'config/mediaConfigs/mediaConfigs';

import contextToString from 'utils/contextToString';
import { downloadLink } from 'utils/helper';

const EVENTS = {
  onAudioPlay: 'onAudioPlay',
};

function useAudioBlobURI({
  engine: { events, blobURI },
  format,
  caption,
  name,
  context,
  step,
  index,
  isFullView,
  blobData: blob_uri,
}: AudioBoxProps) {
  const initialBlobData = blobURI.getBlobData(blob_uri);
  const initialSrc =
    initialBlobData && format
      ? `data:audio/${format};base64,${initialBlobData}`
      : '';

  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [processing, setProcessing] = React.useState<boolean>(false);
  const [data, setData] = React.useState({
    blobData: initialBlobData,
    src: initialSrc,
  });
  const audioRef = React.useRef<HTMLMediaElement>(
    document.createElement('audio'),
  );
  const readyToPlayRef = React.useRef<boolean>(false);

  function onPlay() {
    if (data.src) {
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

  function onDownload(): void {
    if (data.src) {
      handleDownload();
    } else {
      setProcessing(true);
      blobURI
        .getBlobsData([blob_uri])
        .call()
        .then(() => {
          const blobData = blobURI.getBlobData(blob_uri);
          const newSrc = `data:audio/${format};base64,${blobData}`;
          setData({ blobData, src: newSrc });
          handleDownload(newSrc);
        });
    }
  }

  function handleDownload(mediaSrc: string = data.src): void {
    const strContext = contextToString(context);
    const contextName = strContext === '' ? '' : `_${strContext}`;
    downloadLink(mediaSrc, `${name}${contextName}_${caption}_${step}_${index}`);
  }

  React.useEffect(() => {
    const audio = audioRef.current;
    if (data.src) {
      if (isPlaying) {
        audio.muted = false;
        // eslint-disable-next-line no-console
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, data.src]);

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
      setData({
        blobData,
        src: `data:audio/${format};base64,${blobData}`,
      });
    };

    if (processing && data.blobData === null) {
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
  }, [data.blobData, blobURI, blob_uri, format, processing]);

  React.useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
      readyToPlayRef.current = false;
    };
  }, []);

  return {
    audioRef,
    data,
    setIsPlaying,
    setProcessing,
    onPlay,
    onDownload,
    processing,
    isPlaying,
    readyToPlay: readyToPlayRef.current,
    caption,
    name,
    step,
    index,
  };
}

export default useAudioBlobURI;
