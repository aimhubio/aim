import React from 'react';
import AudioPlayer from 'material-ui-audio-player';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Spinner, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { BATCH_COLLECT_DELAY } from 'config/mediaConfigs/mediaConfigs';

import { IBoxProps } from 'modules/BaseExplorer/types';

import contextToString from 'utils/contextToString';
import { downloadLink } from 'utils/helper';

import AudioBoxProgress from './AudioBoxProgress';
import AudioBoxVolume from './AudioBoxVolume';

import './AudioBox.scss';

function AudioBox(
  props: IBoxProps,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    engine: { events, blobURI },
    data: {
      data: { blob_uri, format, index, caption },
      audios,
      record,
    },
    isFullView,
  } = props;
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [audio, setAudio] = React.useState<any>(null);
  const [processing, setProcessing] = React.useState<boolean>(false);
  const [src, setSrc] = React.useState<string>('');
  const [blobData, setBlobData] = React.useState<string>(
    blobURI.getBlobData(blob_uri),
  );
  const [muted, setMuted] = React.useState<boolean>(true);

  const readyToPlay = React.useRef<boolean>(false);

  React.useEffect(() => {
    let timeoutID: number;
    let unsubscribe: () => void;
    if (processing) {
      if (blobData === null) {
        if (blobURI.getBlobData(blob_uri)) {
          setBlobData(blobURI.getBlobData(blob_uri));
        } else {
          unsubscribe = blobURI.on(blob_uri, (blobData: string) => {
            setBlobData(blobData);
            unsubscribe();
          });
          timeoutID = window.setTimeout(() => {
            if (blobURI.getBlobData(blob_uri)) {
              setBlobData(blobURI.getBlobData(blob_uri));
              unsubscribe();
            } else {
              // addUriToList(blob_uri);
            }
          }, BATCH_COLLECT_DELAY);
        }
      }
    }
    return () => {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      if (unsubscribe) {
        unsubscribe();
      }
      if (audio) {
        audio.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing]);

  React.useEffect(() => {
    if (blobData) {
      const audioRef = new Audio();
      audioRef.autoplay = true;
      audioRef.muted = true;
      audioRef.preload = 'metadata';
      audioRef.src = `data:audio/${format};base64,${blobData}`;
      setSrc(`data:audio/${format};base64,${blobData}`);
      setAudio(audioRef);
      setMuted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobData]);

  React.useEffect(() => {
    if (isPlaying) {
      audio?.play().then(() => {
        setMuted(false);
      });
    } else {
      audio?.pause();
    }
  }, [isPlaying, audio]);

  React.useEffect(() => {
    // Pause and clean up on unmount
    if (audio) {
      audio.addEventListener('ended', onAudioEnded);
      audio.addEventListener('canplay', handleReadyToPlay);
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('ended', onAudioEnded);
        audio.removeEventListener('canplay', handleReadyToPlay);
      }
    };
  }, [audio]);

  React.useEffect(() => {
    if (audio && !muted) {
      audio.muted = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  React.useEffect(() => {
    const unsubscribe = events.on(
      'onAudioPlay',
      (payload: { blob_uri: string; isFullView: boolean }) => {
        if (
          payload.blob_uri !== blob_uri ||
          payload.isFullView !== isFullView
        ) {
          setIsPlaying(false);
        }
      },
    );
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleReadyToPlay(): void {
    setProcessing(false);
  }

  function onAudioEnded(): void {
    setIsPlaying(false);
  }

  function onPlayChange(): void {
    if (audio) {
      readyToPlay.current = true;
      events.fire('onAudioPlay', { blob_uri, isFullView });
      setIsPlaying(!isPlaying);
    } else {
      setProcessing(true);
      blobURI
        .getBlobsData([blob_uri])
        .call()
        .then(() => {
          readyToPlay.current = true;
          events.fire('onAudioPlay', { blob_uri, isFullView });
          setIsPlaying(!isPlaying);
        });
    }
  }

  function onDownload(): void {
    if (audio) {
      handleDownload();
    } else {
      setProcessing(true);
      blobURI.getBlobsData([blob_uri]).call().then(handleDownload);
    }
  }

  function handleDownload(): void {
    const { step } = record;
    const { context, name: audio_name } = audios;
    const contextName =
      contextToString(context) === '' ? '' : `_${contextToString(context)}`;
    const name = `${audio_name}${contextName}_${caption}_${step}_${index}`;

    downloadLink(`data:audio/${format};base64,${blobData}`, name);
  }

  return (
    <ErrorBoundary>
      <div className='AudioBox'>
        <div className='AudioBox__controllers'>
          <div className='AudioBox__controllers__player'>
            {audio ? (
              <Button
                onClick={onPlayChange}
                color='secondary'
                withOnlyIcon
                size='xSmall'
              >
                <Icon name={isPlaying ? 'pause' : 'play'} />
              </Button>
            ) : (
              <>
                <AudioPlayer
                  displaySlider={false}
                  volume={false}
                  displayCloseButton={false}
                  onPlayed={onPlayChange}
                  width='24px'
                  src={src}
                />
                {processing ? (
                  <Spinner
                    className='Icon__container'
                    size={12}
                    color='#414b6d'
                    thickness={2}
                  />
                ) : (
                  <Icon name={isPlaying ? 'pause' : 'play'} />
                )}
              </>
            )}
          </div>
          <AudioBoxProgress
            audio={audio}
            isPlaying={isPlaying}
            src={src}
            disabled={!readyToPlay.current}
          />
          <AudioBoxVolume audio={audio} />
          <div className='AudioBox__controllers__download'>
            <Button withOnlyIcon size='xSmall' onClick={onDownload}>
              {processing ? (
                <Spinner
                  className='Icon__container'
                  size={12}
                  color='#414b6d'
                  thickness={2}
                />
              ) : (
                <Icon name='download' />
              )}
            </Button>
          </div>
        </div>
        <Tooltip title={caption || ''}>
          <div>
            <Text
              title={caption || ''}
              className='AudioBox__caption'
              size={8}
              weight={400}
            >
              {caption || ''}
            </Text>
          </div>
        </Tooltip>
      </div>
    </ErrorBoundary>
  );
}

export default AudioBox;
