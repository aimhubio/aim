import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Button, Icon, Slider } from 'components/kit';

import { IAudioBoxVolumeProps } from './AudioBox.d';

function AudiosVolumeController({ audio }: IAudioBoxVolumeProps) {
  const [volume, setVolume] = React.useState<number>(0.99);

  function onVolumeChange(e: any, value: number | number[]): void {
    if (audio) {
      audio.volume = value as number;
      setVolume(value as number);
    }
  }

  React.useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [volume, audio]);

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
    <ErrorBoundary>
      <div
        className={`AudioBox__controllers__volume ${
          audio ? '' : 'AudioBox__controllers__volume-disabled'
        }`}
      >
        <Button
          onClick={onVolumeToggle}
          withOnlyIcon
          size='small'
          className='AudioBox__controllers__volume--button'
        >
          <Icon name={volume === 0 ? 'voice-off' : 'voice-on'} />
        </Button>
        <div className='AudioBox__controllers__volume__Slider'>
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
    </ErrorBoundary>
  );
}

export default AudiosVolumeController;
