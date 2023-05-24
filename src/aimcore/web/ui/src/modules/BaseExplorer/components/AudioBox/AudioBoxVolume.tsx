import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Button, Icon, Slider } from 'components/kit';

import { IAudioBoxVolumeProps } from './AudioBox.d';

function AudioBoxVolume({ audio }: IAudioBoxVolumeProps) {
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
      <div className='AudioBox__controllers__volume'>
        <Button
          onClick={onVolumeToggle}
          withOnlyIcon
          size='xSmall'
          className='AudioBox__controllers__volume--button'
        >
          <Icon name={isMuted || volume === 0 ? 'voice-off' : 'voice-on'} />
        </Button>
        <div className='AudioBox__controllers__volume__Slider'>
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

export default AudioBoxVolume;
