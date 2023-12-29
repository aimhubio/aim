import React from 'react';
import moment from 'moment';

import { Text, Slider } from 'components/kit_v2';
import ErrorBoundary from 'components/ErrorBoundary';

import { AudioPlayerProgressProps } from './';

import './AudioPlayerProgress.scss';

function AudioPlayerProgress({
  audio,
  isPlaying,
  src,
  disabled,
}: AudioPlayerProgressProps) {
  const [trackProgress, setTrackProgress] = React.useState<number>(0);
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
      setTrackProgress(audio.currentTime || 0);
    }, 20);
  }

  function onProgressChange(values: number[]): void {
    clearInterval(intervalRef.current);
    setTrackProgress(values[0]);
  }

  function onTimerChange(values: number[]): void {
    clearInterval(intervalRef.current);
    audio.currentTime = values[0];
    if (isPlaying) {
      startTimer();
    }
  }

  function defineTimeFormat(duration: number): string {
    return duration > 3600 ? 'HH:mm:ss' : 'mm:ss';
  }

  function formatDuration(): string {
    return moment
      .utc(Math.round(audio.duration || 0) * 1000)
      .format(defineTimeFormat(audio.duration || 0));
  }

  function formatProgress(): string {
    return moment
      .utc(Math.round(trackProgress) * 1000)
      .format(defineTimeFormat(audio.duration || 0));
  }

  return (
    <ErrorBoundary>
      <div className='AudioPlayerProgress'>
        <Slider
          className='AudioPlayerProgress__progressSlider'
          onValueCommit={onTimerChange}
          onValueChange={onProgressChange}
          value={[trackProgress]}
          step={0.1}
          max={audio.duration || 1}
          min={0}
          disabled={disabled}
          showLabel={false}
        />
        <div
          className={`AudioPlayerProgress__timer ${
            audio.duration && audio.duration > 3600
              ? 'AudioPlayerProgress__timer-long'
              : ''
          }`}
        >
          <Text weight={400} size={12}>
            {formatProgress() || '00:00'}
          </Text>
          <Text weight={400} size={12}>
            /{formatDuration() || '00:00'}
          </Text>
        </div>
      </div>
    </ErrorBoundary>
  );
}
export default AudioPlayerProgress;
