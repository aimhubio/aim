import React from 'react';
import moment from 'moment';

import { CircularProgress } from '@material-ui/core';

import { Button, Icon, Slider, Text } from 'components/kit';

import { batchCollectDelay } from 'config/imagesConfigs/imagesConfig';

import blobsURIModel from 'services/models/media/blobsURIModel';

import { IAudioBoxProps } from './AudioBox.d';

import './AudioBox.scss';

function AudiBoxProgress({ audio, isPlaying }: any) {
  const [trackProgress, setTrackProgress] = React.useState(0);
  const intervalRef = React.useRef<any>({});

  React.useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (isPlaying && audio) {
      startTimer();
    } else {
      clearInterval(intervalRef.current);
    }
  }, [isPlaying]);

  function startTimer(): void {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTrackProgress(Math.round(audio.currentTime));
    }, 300);
  }

  function onProgressChange(event: any, value: number | number[]): void {
    if (audio) {
      clearInterval(intervalRef.current);
    }
    setTrackProgress(value as number);
  }

  function onTimerChange(): void {
    if (audio) {
      clearInterval(intervalRef.current);
      audio.currentTime = trackProgress;
      if (isPlaying) {
        startTimer();
      }
    }
  }

  function formatDuration(): string {
    return moment
      .utc(Math.round(audio?.duration || 0) * 1000)
      .format('HH:mm:ss');
  }

  function formatProgress(): string {
    return moment.utc(Math.round(trackProgress || 0) * 1000).format('HH:mm:ss');
  }

  return (
    <>
      <Slider
        containerClassName='AudioBox__progressSlider'
        onChangeCommitted={onTimerChange}
        onChange={onProgressChange}
        value={trackProgress}
        step={1}
        max={Math.round(audio?.duration)}
        min={0}
      />
      <div className='AudioBox__timer'>
        <Text weight={400} size={8}>
          {(audio && formatProgress()) || '00:00:00'}
        </Text>
        <Text weight={400} size={8}>
          / {(audio && formatDuration()) || '00:00:00'}
        </Text>
      </div>
    </>
  );
}

function AudioBoxVolume({ audio }: any) {
  const [volume, setVolume] = React.useState(0.99);

  function onVolumeChange(event: any, value: number | number[]): void {
    if (audio) {
      audio.volume = value as number;
    }
    setVolume(value as number);
  }

  React.useEffect(() => {
    if (audio) audio.volume = volume;
  }, [volume]);

  function onVolumeToggle(): void {
    if (audio) {
      if (audio.volume === 0) {
        setVolume(0.99);
      } else {
        setVolume(0);
      }
    }
  }

  return (
    <div className='AudioBox__volume'>
      <Button
        onClick={onVolumeToggle}
        withOnlyIcon
        size='small'
        className='AudioBox__volume--button'
      >
        <Icon name={volume === 0 ? 'voice-off' : 'voice-on'} />
      </Button>
      <div className='AudioBox__volume__Slider'>
        <Slider
          onChange={onVolumeChange}
          value={volume}
          step={0.01}
          defaultValue={1}
          max={0.99}
          min={0}
        />
      </div>
    </div>
  );
}

function AudioBox({
  data,
  additionalProperties,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const { format, blob_uri } = data;
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [audio, setAudio] = React.useState<any>(null);
  const [processing, setProcessing] = React.useState(false);
  let [blobData, setBlobData] = React.useState<string>(
    blobsURIModel.getState()[blob_uri] ?? null,
  );

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
          }, batchCollectDelay);
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
    };
  }, [processing]);

  React.useEffect(() => {
    if (blobData) {
      setAudio(new Audio(`data:audio/${format};base64,${blobData}`));
    }
  }, [blobData]);

  React.useEffect(() => {
    if (isPlaying) {
      audio?.play();
    } else {
      audio?.pause();
    }
  }, [isPlaying]);

  React.useEffect(() => {
    // Pause and clean up on unmount
    if (audio) {
      audio?.addEventListener('ended', onAudioEnded);
      audio?.addEventListener('canplay', handleReadyToPlay);
    }
    return () => {
      audio?.pause();
    };
  }, [audio]);

  function handleReadyToPlay() {
    setProcessing(false);
  }

  function onAudioEnded(): void {
    setIsPlaying(false);
  }

  function onPLayChange(): void {
    if (audio) {
      setIsPlaying(!isPlaying);
    } else {
      setProcessing(true);
      additionalProperties
        .getAudiosBlobsData([blob_uri])
        .call()
        .then((a: any) => {
          setIsPlaying(!isPlaying);
        });
    }
  }

  function onDownload(): void {
    var element = document.createElement('a');
    element.setAttribute('href', `data:audio/${format};base64,${blobData}`);
    element.setAttribute('download', 'name');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className='AudioBox'>
      <Button
        onClick={onPLayChange}
        color='secondary'
        withOnlyIcon
        size='small'
      >
        {processing ? (
          <CircularProgress size={12} thickness={4} />
        ) : (
          <Icon name={isPlaying ? 'pause' : 'play'} />
        )}
      </Button>
      <AudiBoxProgress audio={audio} isPlaying={!!blobData && isPlaying} />
      <AudioBoxVolume audio={audio} />
      <Button
        withOnlyIcon
        size='small'
        onClick={() => {
          onDownload();
        }}
      >
        <Icon name='download' />
      </Button>
    </div>
  );
}

AudioBox.displayName = 'AudioBox';

export default React.memo<IAudioBoxProps>(AudioBox);
