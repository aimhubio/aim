import React from 'react';
import moment from 'moment';

import { CircularProgress } from '@material-ui/core';

import { Button, Icon, Slider, Text } from 'components/kit';

import { batchCollectDelay } from 'config/imagesConfigs/imagesConfig';

import blobsURIModel from 'services/models/media/blobsURIModel';

import { IAudioBoxProps } from './AudioBox.d';

import './AudioBox.scss';

function AudiBoxProgress({ audioRef, isPlaying }: any) {
  const [trackProgress, setTrackProgress] = React.useState(0);
  const intervalRef = React.useRef<any>({});

  React.useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (isPlaying) {
      startTimer();
    } else {
      clearInterval(intervalRef.current);
    }
  }, [isPlaying]);

  function startTimer(): void {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTrackProgress(Math.round(audioRef.current.currentTime));
    }, 300);
  }

  function onProgressChange(event: any, value: number | number[]): void {
    clearInterval(intervalRef.current);
    setTrackProgress(value as number);
  }

  function onTimerChange(): void {
    clearInterval(intervalRef.current);
    audioRef.current.currentTime = trackProgress;
    if (isPlaying) {
      startTimer();
    }
  }

  function formatDuration(): string {
    return moment
      .utc(Math.round(audioRef.current?.duration || 0) * 1000)
      .format('HH:mm:ss');
  }

  function formatProgress(): string {
    return moment.utc(Math.round(trackProgress) * 1000).format('HH:mm:ss');
  }

  return (
    <>
      <Slider
        containerClassName='AudioBox__progressSlider'
        onChangeCommitted={onTimerChange}
        onChange={onProgressChange}
        value={trackProgress}
        step={1}
        max={Math.round(audioRef.current?.duration)}
        min={0}
      />
      <div className='AudioBox__timer'>
        <Text weight={400} size={8}>
          {audioRef.current && formatProgress()}
        </Text>
        <Text weight={400} size={8}>
          / {audioRef.current && formatDuration()}
        </Text>
      </div>
    </>
  );
}

function AudioBoxVolume({ audioRef }: any) {
  const [volume, setVolume] = React.useState(0.99);

  function onVolumeChange(event: any, value: number | number[]): void {
    audioRef.current.volume = value as number;
    setVolume(value as number);
  }

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  function onVolumeToggle(): void {
    if (audioRef.current.volume === 0) {
      setVolume(0.99);
    } else {
      setVolume(0);
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
  const [canPlay, setCanPlay] = React.useState(true);
  const audioRef = React.useRef<any>(null);
  let [blobData, setBlobData] = React.useState<string>(
    blobsURIModel.getState()[blob_uri] ?? null,
  );

  React.useEffect(() => {
    let timeoutID: number;
    let subscription: any;

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

    return () => {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  React.useEffect(() => {
    if (blobData) {
      audioRef.current = new Audio(`data:audio/${format};base64,${blobData}`);
    }
  }, [blobData]);

  React.useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  React.useEffect(() => {
    // Pause and clean up on unmount
    audioRef.current?.addEventListener('ended', onAudioEnded);
    // audioRef.current?.addEventListener('canplay', handleReadyToPlay);
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function handleReadyToPlay() {
    setCanPlay(true);
  }
  function onAudioEnded(): void {
    setIsPlaying(false);
  }

  function onPLayChange(): void {
    setIsPlaying(!isPlaying);

    if (!blobData) {
      additionalProperties
        .getAudiosBlobsData([blob_uri])
        .call()
        .then((a: any) => {
          setIsPlaying(!isPlaying);
        });
    } else {
      setIsPlaying(!isPlaying);
    }
  }

  function onDownload(): void {
    var element = document.createElement('a');
    element.setAttribute('href', 'https://dl2.mp3party.net/online/8881505.mp3');
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
        {canPlay ? (
          <Icon name={isPlaying ? 'pause' : 'play'} />
        ) : (
          <CircularProgress size={12} thickness={4} />
        )}
      </Button>
      <AudiBoxProgress
        audioRef={audioRef}
        isPlaying={!!blobData && isPlaying}
      />
      <AudioBoxVolume audioRef={audioRef} />
      <Button withOnlyIcon size='small' onClick={onDownload}>
        <Text size={14}>
          <Icon name='download' />
        </Text>
      </Button>
    </div>
  );
}

AudioBox.displayName = 'AudioBox';

export default React.memo<IAudioBoxProps>(AudioBox);
