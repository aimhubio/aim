import React from 'react';

import { IconVolume, IconVolumeOff } from '@tabler/icons-react';

import ErrorBoundary from 'components/ErrorBoundary';
import { IconButton, Slider } from 'components/kit_v2';

import { AudioPlayerVolumeProps } from './';

import './AudioPlayerVolume.scss';

function AudioPlayerVolume({ audio }: AudioPlayerVolumeProps) {
  const [volume, setVolume] = React.useState<number>(0.99);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  function onVolumeChange(values: number[]): void {
    setVolume(values[0] as number);
    setIsMuted(false);
  }
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

  React.useEffect(() => {
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, audio, isMuted]);

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
            onValueChange={onVolumeChange}
            value={[isMuted ? 0 : volume]}
            step={0.01}
            defaultValue={[1]}
            max={1}
            min={0}
            showLabel={false}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default AudioPlayerVolume;
