import React from 'react';
import moment from 'moment';

import { Slider, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IAudioBoxProgressProps } from './AudioBox.d';

function AudioBoxProgress({ audio, isPlaying, src }: IAudioBoxProgressProps) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, src]);

  function startTimer(): void {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTrackProgress(audio.currentTime);
    }, 100);
  }

  function onProgressChange(e: any, value: number | number[]): void {
    if (audio) {
      clearInterval(intervalRef.current);
      setTrackProgress(value as number);
    }
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
      .utc(Math.round(audio.duration || 0) * 1000)
      .format(defineTimeFormat(audio.duration || 0));
  }

  function defineTimeFormat(duration: number): string {
    return duration > 3600 ? 'HH:mm:ss' : 'mm:ss';
  }

  function formatProgress(): string {
    return moment
      .utc(Math.round(trackProgress) * 1000)
      .format(defineTimeFormat(audio.duration || 0));
  }

  return (
    <ErrorBoundary>
      <Slider
        containerClassName='AudioBox__controllers__progressSlider'
        onChangeCommitted={onTimerChange}
        onChange={onProgressChange}
        value={trackProgress}
        step={0.1}
        max={Math.round(audio?.duration)}
        min={0}
        disabled={!audio}
      />
      <div
        className={`AudioBox__controllers__timer ${
          audio?.duration > 3600 ? 'AudioBox__controllers__timer-long' : ''
        }`}
      >
        <Text weight={400} size={8}>
          {(audio && formatProgress()) || '00:00'}
        </Text>
        <Text weight={400} size={8}>
          / {(audio && formatDuration()) || '00:00'}
        </Text>
      </div>
    </ErrorBoundary>
  );
}
export default AudioBoxProgress;
