import * as React from 'react';
import cx from 'classnames';

import Slider from '@material-ui/core/Slider';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import VolumeOff from '@material-ui/icons/VolumeOff';
import VolumeUp from '@material-ui/icons/VolumeUp';

import { IAudioPlayerColors, Icons } from './AudioPlayer';
import PLAYER from './state/player';

export const useComponentStyles = makeStyles((theme: any) => {
  return {
    sliderContainer: {
      flex: '1 1 auto',
    },
    slider: (props: any) => ({
      color: props.playerColors.active,
    }),
    commonContainer: {
      flex: '0 0 auto',
      '&:hover': {
        cursor: 'pointer',
      },
    },
    icon: (props: any) => ({
      color: props.playerColors.active,
      '&:hover': {
        color: props.playerColors.hover,
      },
    }),
    volumeIconContainer: {
      position: 'relative',
      '&:hover': {
        cursor: 'pointer',
      },
    },
    volumeControlContainer: {
      position: 'absolute',
      display: 'none',
      zIndex: 10,
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        height: '60px',
      },
      padding: '10px 5px',
    },
  };
});
interface IPlayerVolume {
  status: string;
  value: number;
}

interface IAudioDownloadsControl {
  playerColors: IAudioPlayerColors;
  volume: IPlayerVolume;
  muted?: Boolean | null;
  muteAudio: () => void;
  unmuteAudio: () => void;
  changeAudioVolume: (value: any) => void;
  icons?: Icons;
  classNames?: any;
}

export const AudioVolumeControl: React.FunctionComponent<IAudioDownloadsControl> =
  ({
    muted = null,
    muteAudio,
    unmuteAudio,
    classNames = {},
    volume,
    changeAudioVolume,
    icons = {},
    playerColors,
  }) => {
    const classes = useComponentStyles({ playerColors });
    const { VolumeUpIcon = VolumeUp, VolumeOffIcon = VolumeOff } = icons;
    const handleVolumeChange = (event: object, value: any) => {
      changeAudioVolume(value);
    };
    const [volumeSlider, openVolumeSlider] = React.useState(false);
    const toggleVolumeSlider = (value: boolean) => () => {
      openVolumeSlider(value);
    };

    return (
      <Grid
        item={true}
        className={cx(classes.commonContainer, classes.volumeIconContainer)}
        onMouseEnter={toggleVolumeSlider(true)}
        onMouseLeave={toggleVolumeSlider(false)}
      >
        {volume.status === PLAYER.VOLUME.STATUS.UNMUTE ? (
          <VolumeUpIcon
            fontSize='large'
            className={cx(classes.icon, classNames.volumeIcon)}
            onClick={typeof muted !== 'boolean' ? muteAudio : () => {}}
          />
        ) : (
          <VolumeOffIcon
            fontSize='large'
            className={cx(classes.icon, classNames.volumeIcon)}
            onClick={typeof muted !== 'boolean' ? unmuteAudio : () => {}}
          />
        )}
        {volumeSlider && (
          <Paper
            className={cx(
              classes.volumeControlContainer,
              classNames.volumeSliderContainer,
            )}
          >
            <Slider
              orientation='vertical'
              aria-labelledby='volume-control'
              value={volume.value}
              defaultValue={PLAYER.VOLUME.DEFAULT_VALUE}
              onChange={handleVolumeChange}
              className={cx(classes.slider, classNames.volumeSlider)}
            />
          </Paper>
        )}
      </Grid>
    );
  };

export default React.memo(AudioVolumeControl);
