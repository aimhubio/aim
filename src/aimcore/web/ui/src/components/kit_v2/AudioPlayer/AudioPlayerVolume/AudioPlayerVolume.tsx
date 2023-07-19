import React from 'react';

import { IconVolume, IconVolumeOff } from '@tabler/icons-react';

import ErrorBoundary from 'components/ErrorBoundary';
import { Slider } from 'components/kit';
import { IconButton } from 'components/kit_v2';

import { AudioPlayerVolumeProps } from './';

import './AudioPlayerVolume.scss';

function AudioPlayerVolume({ audio }: AudioPlayerVolumeProps) {
  const [volume, setVolume] = React.useState<number>(0.99);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);

  function onVolumeChange(e: any, value: number | number[]): void {
    setVolume(value as number);
    setIsMuted(false);
  }

  React.useEffect(() => {
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, audio, isMuted]);

  function onVolumeToggle(): void {
    if (isMuted) {
      setIsMuted(false);
    } else if (volume === 0) {
      setIsMuted(false);
      setVolume(0.99);
    } else {
      setIsMuted(true);
    }
  }

  return (
    <ErrorBoundary>
      <div className='AudioPlayerVolume'>
        <IconButton
          variant='ghost'
          icon={isMuted || volume === 0 ? <IconVolumeOff /> : <IconVolume />}
          className='AudioPlayerVolume__button'
          onClick={onVolumeToggle}
        />

        <div className='AudioPlayerVolume__slider'>
          <Slider
            onChange={onVolumeChange}
            value={isMuted ? 0 : volume}
            step={0.01}
            defaultValue={1}
            max={0.99}
            min={0}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default AudioPlayerVolume;
