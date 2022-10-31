import React from 'react';
import AudioPlayer from 'material-ui-audio-player';

import { Button, Icon, Spinner, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { BATCH_COLLECT_DELAY } from 'config/mediaConfigs/mediaConfigs';

import contextToString from 'utils/contextToString';

import AudioBoxProgress from './AudioBoxProgress';
import AudioBoxVolume from './AudioBoxVolume';
import { IAudioBoxProps } from './AudioBox.d';

import './AudioBox.scss';

function AudioBox(
  props: IAudioBoxProps,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    engine,
    data: {
      data: { blob_uri, format, index, caption },
      audios,
      record,
    },
  } = props;
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [audio, setAudio] = React.useState<any>(null);
  const [processing, setProcessing] = React.useState<boolean>(false);
  let [src, setSrc] = React.useState<string>('');
  let [blobData, setBlobData] = React.useState<string>(
    engine.blobURI.getBlobData(blob_uri),
  );
  let [muted, setMuted] = React.useState<boolean>(true);

  React.useEffect(() => {
    let timeoutID: number;
    let unsubscribe: () => void;
    if (processing) {
      if (blobData === null) {
        if (engine.blobURI.getBlobData(blob_uri)) {
          setBlobData(engine.blobURI.getBlobData(blob_uri));
        } else {
          unsubscribe = engine.blobURI.on(blob_uri, (blobData: string) => {
            setBlobData(blobData);
            unsubscribe();
          });
          timeoutID = window.setTimeout(() => {
            if (engine.blobURI.getBlobData(blob_uri)) {
              setBlobData(engine.blobURI.getBlobData(blob_uri));
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
    const unsubscribe = engine.events.on('onAudioPlay', (payload: string) => {
      if (payload !== blob_uri) {
        setIsPlaying(false);
      }
    });
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (blobData) {
      const audioRef = new Audio();
      audioRef.autoplay = true;
      audioRef.muted = true;
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
    if (!muted) {
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

  function onPLayChange(): void {
    if (audio) {
      engine.events.fire('onAudioPlay', blob_uri);
      setIsPlaying(!isPlaying);
    } else {
      setProcessing(true);
      engine.blobURI
        .getBlobsData([blob_uri])
        .call()
        .then(() => {
          engine.events.fire('onAudioPlay', blob_uri);
          setIsPlaying(!isPlaying);
        });
    }
  }

  function onDownload(): void {
    if (audio) {
      handleDownload();
    } else {
      setProcessing(true);
      engine.blobURI
        .getBlobsData([blob_uri])
        .call()
        .then(() => {
          handleDownload();
        });
    }
  }

  function handleDownload(): void {
    const element: HTMLAnchorElement = document.createElement('a');
    const { step } = record;
    const { context, name: audio_name } = audios;
    const contextName: string =
      contextToString(context) === '' ? '' : `_${contextToString(context)}`;
    const name: string = `${audio_name}${contextName}_${caption}_${step}_${index}`;

    element.setAttribute('href', `data:audio/${format};base64,${blobData}`);
    element.setAttribute('download', name);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <ErrorBoundary>
      <div className='AudioBox'>
        <div className='AudioBox__controllers'>
          <div className='AudioBox__controllers__player'>
            {audio ? (
              <Button
                onClick={onPLayChange}
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
                  onPlayed={onPLayChange}
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
          <AudioBoxProgress audio={audio} isPlaying={isPlaying} src={src} />
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
        <Text
          title={caption || ''}
          className='AudioBox__caption'
          size={8}
          weight={400}
        >
          {caption || ''}
        </Text>
      </div>
    </ErrorBoundary>
  );
}

export default AudioBox;
