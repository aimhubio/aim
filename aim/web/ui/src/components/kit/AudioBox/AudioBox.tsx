import React from 'react';
import moment from 'moment';

import { Button, Icon, Slider, Text } from 'components/kit';

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
      .utc(Math.round(audioRef.current.duration || 0) * 1000)
      .format(defineTimeFormat(audioRef.current.duration || 0));
  }

  function defineTimeFormat(duration: number): string {
    return duration > 3600 ? 'HH:mm:ss' : 'mm:ss';
  }

  function formatProgress(): string {
    return moment
      .utc(Math.round(trackProgress) * 1000)
      .format(defineTimeFormat(audioRef.current.duration || 0));
  }

  return (
    <>
      <Slider
        containerClassName='AudioBox__progressSlider'
        onChangeCommitted={onTimerChange}
        onChange={onProgressChange}
        value={trackProgress}
        step={1}
        max={Math.round(audioRef.current.duration)}
        min={0}
      />
      <div
        className={`AudioBox__timer ${
          audioRef.current.duration > 3600 ? 'AudioBox__timer-long' : ''
        }`}
      >
        <Text weight={400} size={10}>
          {formatProgress()}
        </Text>
        <Text weight={400} size={10}>
          / {formatDuration()}
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
    audioRef.current.volume = volume;
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
        <Text size={16}>
          <Icon name={volume === 0 ? 'voice-off' : 'voice-on'} />
        </Text>
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

function AudioBox({}: IAudioBoxProps): React.FunctionComponentElement<React.ReactNode> {
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [canPlay, setCanPlay] = React.useState(false);
  const audioRef = React.useRef(
    new Audio(
      'https://mp3minusovki.com/music/fhvndfjwserjgt/9f51406596884933e4a839b32e7e528e/2a8e57d1d2e0a7556a4f6e94a311f4d5.mp3',
    ),
  );

  React.useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  React.useEffect(() => {
    // Pause and clean up on unmount
    audioRef.current.addEventListener('ended', onAudioEnded);
    audioRef.current.addEventListener('canplay', handleReadyToPlay);
    return () => {
      audioRef.current.pause();
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
  }

  function onDownload(): void {
    var element = document.createElement('a');
    element.setAttribute(
      'href',
      'https://mp3minusovki.com/music/fhvndfjwserjgt/9f51406596884933e4a839b32e7e528e/2a8e57d1d2e0a7556a4f6e94a311f4d5.mp3',
    );
    element.setAttribute('download', 'name');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className={'AudioBox'}>
      <Button
        onClick={onPLayChange}
        color='secondary'
        withOnlyIcon
        size='small'
      >
        <Text>
          <Icon name={isPlaying ? 'pause' : 'play'} />
        </Text>
      </Button>
      <AudiBoxProgress audioRef={audioRef} isPlaying={isPlaying} />
      <AudioBoxVolume audioRef={audioRef} />
      <Button withOnlyIcon size='small' onClick={onDownload}>
        <Text size={16}>
          <Icon name='download' />
        </Text>
      </Button>
    </div>
  );
}

AudioBox.displayName = 'AudioBox';

export default React.memo<IAudioBoxProps>(AudioBox);
