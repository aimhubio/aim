import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary';
import { Tooltip, Text } from 'components/kit_v2';

import { Button, Icon, Spinner } from '../kit';

import { AudioPlayerProps, AudioPlayerProgress, AudioPlayerVolume } from '.';

import './AudioPlayer.scss';

function AudioPlayer(props: AudioPlayerProps) {
  const {
    preload = 'metadata',
    muted = true,
    autoPlay = true,
    audioRef,
    src,
    onEnded,
    onCanPlay,
    onPlay,
    onPause,
    isPlaying = false,
    processing = false,
    caption = '',
    readyToPlay = false,
    onDownload,
  } = props;

  return (
    <ErrorBoundary>
      <div className='AudioPlayer'>
        <div className='AudioPlayer__controllers'>
          <div className='AudioPlayer__controllers__player'>
            <audio
              ref={audioRef}
              src={src}
              preload={preload}
              muted={muted}
              autoPlay={autoPlay}
              onEnded={onEnded}
              onCanPlay={onCanPlay}
              onPlay={onPlay}
              onPause={onPause}
            />
            <>
              {processing ? (
                <Spinner
                  className='Icon__container'
                  size={12}
                  color='#414b6d'
                  thickness={2}
                />
              ) : (
                <Button
                  onClick={isPlaying ? onPause : onPlay}
                  color='secondary'
                  withOnlyIcon
                  size='xSmall'
                >
                  <Icon name={isPlaying ? 'pause' : 'play'} />
                </Button>
              )}
            </>
          </div>
          <AudioPlayerProgress
            audio={audioRef.current}
            isPlaying={isPlaying}
            src={src}
            disabled={!readyToPlay}
          />
          <AudioPlayerVolume audio={audioRef.current} />
          <div className='AudioPlayer__controllers__download'>
            <Button withOnlyIcon size='xSmall' onClick={onDownload}>
              {processing ? (
                <Spinner
                  className='Icon__container'
                  size={12}
                  color='#414b6d'
                  thickness={2}
                />
              ) : (
                <Icon name='download' />
              )}
            </Button>
          </div>
        </div>
        {caption ? (
          <Tooltip content={caption} contentProps={{ side: 'bottom' }}>
            <Text as='p' weight={400} size={8} ellipsis css={{ marginTop: 4 }}>
              {caption}
            </Text>
          </Tooltip>
        ) : null}
      </div>
    </ErrorBoundary>
  );
}

AudioPlayer.displayName = 'AudioPlayer';
export default AudioPlayer;
