import React from 'react';

import { Button, Icon, Spinner, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import AudioPlayer from 'components/AudioPlayer';

import { BATCH_COLLECT_DELAY } from 'config/mediaConfigs/mediaConfigs';

import AudioBoxProgress from 'modules/BaseExplorer/components/AudioBox/AudioBoxProgress';
import AudioBoxVolume from 'modules/BaseExplorer/components/AudioBox/AudioBoxVolume';

import blobsURIModel from 'services/models/media/blobsURIModel';

import contextToString from 'utils/contextToString';
import { downloadLink } from 'utils/helper';

import { IAudioBoxProps } from '.';

import './AudioBox.scss';

function AudioBox({
  data,
  additionalProperties,
  style = {},
}: IAudioBoxProps): React.FunctionComponentElement<React.ReactNode> {
  const { blob_uri } = data;
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [audio, setAudio] = React.useState<any>(null);
  const [processing, setProcessing] = React.useState<boolean>(false);
  let [src, setSrc] = React.useState<string>('');
  let [blobData, setBlobData] = React.useState<string>(
    blobsURIModel.getState()[blob_uri] ?? null,
  );
  let [muted, setMuted] = React.useState<boolean>(true);

  const readyToPlay = React.useRef<boolean>(false);

  React.useEffect(() => {
    let timeoutID: number;
    let subscription: any;
    if (processing) {
      if (blobData === null) {
        if (blobsURIModel.getState()[blob_uri]) {
          setBlobData(blobsURIModel.getState()[blob_uri]);
        } else {
          subscription = blobsURIModel.subscribe(blob_uri, (data) => {
            setBlobData(data[blob_uri]);
            subscription.unsubscribe();
          });
          timeoutID = window.setTimeout(() => {
            if (blobsURIModel.getState()[blob_uri]) {
              setBlobData(blobsURIModel.getState()[blob_uri]);
              subscription.unsubscribe();
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
      if (subscription) {
        subscription.unsubscribe();
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
      audioRef.src = `data:audio/${data.format};base64,${blobData}`;
      setSrc(`data:audio/${data.format};base64,${blobData}`);
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

  function handleReadyToPlay(): void {
    setProcessing(false);
  }

  function onAudioEnded(): void {
    setIsPlaying(false);
  }

  function onPlayChange(): void {
    if (audio) {
      readyToPlay.current = true;
      setIsPlaying(!isPlaying);
    } else {
      setProcessing(true);
      additionalProperties
        .getAudiosBlobsData([blob_uri])
        .call()
        .then(() => {
          readyToPlay.current = true;
          setIsPlaying(!isPlaying);
        });
    }
  }

  function onDownload(): void {
    if (audio) {
      handleDownload();
    } else {
      setProcessing(true);
      additionalProperties
        .getAudiosBlobsData([blob_uri])
        .call()
        .then(handleDownload);
    }
  }

  function handleDownload(): void {
    const { index, format, context, step, caption, audio_name } = data;
    const contextName =
      contextToString(context) === '' ? '' : `_${contextToString(context)}`;
    const name = `${audio_name}${contextName}_${caption}_${step}_${index}`;

    downloadLink(`data:audio/${format};base64,${blobData}`, name);
  }

  return (
    <ErrorBoundary>
      <div className='AudioBox' style={style}>
        <div className='AudioBox__controllers'>
          {audio ? (
            <Button
              onClick={onPlayChange}
              color='secondary'
              withOnlyIcon
              size='small'
            >
              <Icon name={isPlaying ? 'pause' : 'play'} />
            </Button>
          ) : (
            <div className='AudioBox__controllers__player'>
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
            </div>
          )}
          <AudioBoxProgress
            audio={audio}
            isPlaying={isPlaying}
            src={src}
            disabled={!readyToPlay.current}
          />
          <AudioBoxVolume audio={audio} />
          <Button withOnlyIcon size='small' onClick={onDownload}>
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
        <Text
          title={data?.caption || ''}
          className='AudioBox__caption'
          size={8}
          weight={400}
        >
          {data?.caption || ''}
        </Text>
      </div>
    </ErrorBoundary>
  );
}

AudioBox.displayName = 'AudioBox';

export default React.memo<IAudioBoxProps>(AudioBox);
