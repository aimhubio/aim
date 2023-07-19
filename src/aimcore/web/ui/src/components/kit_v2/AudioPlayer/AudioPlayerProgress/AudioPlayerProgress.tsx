import React from 'react';
import moment from 'moment';

import { Slider } from 'components/kit';
import { Text } from 'components/kit_v2';
import ErrorBoundary from 'components/ErrorBoundary';

import { AudioPlayerProgressProps } from './';

import './AudioPlayerProgress.scss';

function AudioPlayerProgress({
  audio,
  isPlaying,
  src,
  disabled,
}: AudioPlayerProgressProps) {
  const [trackProgress, setTrackProgress] = React.useState(0);
  const intervalRef = React.useRef<number>();

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
  }, [isPlaying, src, audio]);

  function startTimer(): void {
    clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTrackProgress(audio?.currentTime || 0);
    }, 100);
  }

  function onProgressChange(e: any, value: number | number[]): void {
    if (audio) {
      clearInterval(intervalRef.current);
      setTrackProgress(value as number);
    }
  }

  function onTimerChange(): void {
    if (audio && !isNaN(trackProgress)) {
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
      .format(defineTimeFormat(audio?.duration || 0));
  }

  function defineTimeFormat(duration: number): string {
    return duration > 3600 ? 'HH:mm:ss' : 'mm:ss';
  }

  function formatProgress(): string {
    return moment
      .utc(Math.round(trackProgress) * 1000)
      .format(defineTimeFormat(audio?.duration || 0));
  }

  return (
    <ErrorBoundary>
      <div className='AudioPlayerProgress'>
        <Slider
          containerClassName='AudioPlayerProgress__progressSlider'
          onChangeCommitted={onTimerChange}
          onChange={onProgressChange}
          value={trackProgress}
          step={0.1}
          max={Math.round(audio?.duration || 0)}
          min={0}
          disabled={disabled}
        />
        <div
          className={`AudioPlayerProgress__timer ${
            audio?.duration && audio.duration > 3600
              ? 'AudioPlayerProgress__timer-long'
              : ''
          }`}
        >
          <Text weight={400} size={12}>
            {(audio && formatProgress()) || '00:00'}
          </Text>
          <Text weight={400} size={12}>
            /{(audio && formatDuration()) || '00:00'}
          </Text>
        </div>
      </div>
    </ErrorBoundary>
  );
}
export default AudioPlayerProgress;
