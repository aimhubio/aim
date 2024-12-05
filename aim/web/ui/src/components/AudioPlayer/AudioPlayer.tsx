// @ts-nocheck
import cx from 'classnames';
import * as React from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';
import Slider from '@material-ui/core/Slider';
import Paper from '@material-ui/core/Paper';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Typography from '@material-ui/core/Typography';
import useTheme from '@material-ui/core/styles/useTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
// tslint:disable-next-line
import Grid, { GridSpacing } from '@material-ui/core/Grid';
import Repeat from '@material-ui/icons/Repeat';

import AudioDownloadsControl from './AudioDownloadsControl';
import AudioPlayControl from './AudioPlayControl';
import AudioVolumeControl from './AudioVolumeControl';
import AudioPlayerCloseButton from './AudioPlayerCloseButton';
import { actionCreators } from './state/actions';
import { getFormattedTime, populateDispatch } from './state/helpers';
import PLAYER from './state/player';
import reducer from './state/reducer';

const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);

const initialState = {
  player: {
    status: PLAYER.STATUS.PAUSE,
    volume: {
      status: PLAYER.VOLUME.STATUS.UNMUTE,
      value: PLAYER.VOLUME.DEFAULT_VALUE,
    },
    duration: 0,
    remaining: 0,
    progress: 0,
    current: 0,
    loop: false,
    autoplay: false,
  },
};

export interface IAudioPlayerClassNameProps {
  root: string;
  playIcon: any;
  volumeIcon: string;
  muteIcon: string;
  mainSlider: string;
  volumeSliderContainer: string;
  volumeSlider: string;
  downloadsIcon: string;
  pauseIcon: string;
  loopIcon: string;
  progressTime: string;
  downloadsContainer: string;
  downloadsItemLink: string;
  downloadsItemText: string;
  closeIcon: string;
}

export const useComponentStyles = makeStyles((theme: any) => {
  const elevations = {};
  theme.shadows.forEach((shadow, index) => {
    elevations[`elevation${index}`] = {
      boxShadow: shadow,
    };
  });

  return {
    root: (props: any) => ({
      position: 'relative',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      width: props.width,
      height: props.height,
      transition: theme.transitions.create('box-shadow'),
    }),
    sliderContainerWrapper: (props: any) => ({
      width: 'auto',
      flex: '1 1 auto',
      display: 'flex',
      boxSizing: 'border-box',
      order: props.componentsOrder,
    }),
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
    iconSelected: (props: any) => ({
      color: props.playerColors.selected,
    }),
    icon: (props: any) => ({
      color: props.playerColors.active,
      '&:hover': {
        color: props.playerColors.hover,
      },
    }),
    rounded: {
      borderRadius: theme.shape.borderRadius,
    },
    ...elevations,
  };
});
export enum AudioPlayerComponentsOrder {
  standard = 'standard',
  reverse = 'reverse',
}
export interface IAudioPlayerColors {
  active: string;
  selected: string;
  disabled: string;
  hover: string;
}

export const getColors = (
  theme,
  variation: keyof typeof AudioPlayerVariation,
): IAudioPlayerColors => {
  if (variation === AudioPlayerVariation.default) {
    return {
      active: theme.palette.action.active,
      selected: theme.palette.action.selected,
      disabled: theme.palette.action.disabled,
      hover: theme.palette.action.hover,
    };
  } else {
    return {
      active: theme.palette[variation].main,
      selected: theme.palette[variation].dark,
      disabled: theme.palette[variation].light,
      hover: theme.palette[variation].light,
    };
  }
};

export enum AudioPlayerVariation {
  primary = 'primary',
  secondary = 'secondary',
  default = 'default',
}

enum AudioPlayerPreload {
  auto = 'auto',
  metadata = 'metadata',
  none = 'none',
}

export enum TimeOption {
  single = 'single',
  double = 'double',
}

export enum TimePosition {
  start = 'start',
  end = 'end',
}

export interface Icons {
  [key: string]: typeof SvgIcon;
}

interface IAudioPlayerProps {
  src: string | string[];
  rounded?: boolean;
  elevation?: number;
  useStyles?: any;
  width?: string;
  height?: string;
  download?: boolean;
  volume?: boolean;
  muted?: boolean | null;
  variation?: keyof typeof AudioPlayerVariation;
  preload?: AudioPlayerPreload;
  loop?: boolean;
  order?: keyof typeof AudioPlayerComponentsOrder;
  displaySlider?: boolean;
  displayCloseButton?: boolean;
  // some browsers will block audio autoplay
  autoplay?: boolean;
  debug?: boolean;
  spacing?: GridSpacing;
  icons?: Icons;
  time?: keyof typeof TimeOption;
  timePosition?: keyof typeof TimePosition;
  onPlayed?: (event: any) => void;
  onPaused?: (event: any) => void;
  onFinished?: (event: any) => void;
  getPlayer?: (
    player: HTMLAudioElement | null,
    dispatch: React.Dispatch<any>,
  ) => void;
  onClose?: () => void;
}

const AudioPlayer: React.FunctionComponent<IAudioPlayerProps> = ({
  src,
  rounded = true,
  elevation = 1,
  useStyles = () => ({}),
  width = '100%',
  height = 'auto',
  variation = AudioPlayerVariation.default,
  preload = AudioPlayerPreload.auto,
  volume = true,
  muted = null,
  download = false,
  autoplay = false,
  order = AudioPlayerComponentsOrder.standard,
  loop = false,
  debug = false,
  spacing = undefined,
  time = 'double',
  timePosition = 'start',
  displaySlider = true,
  displayCloseButton = false,
  icons,
  onPlayed = (event: any) => {},
  onPaused = (event: any) => {},
  onFinished = (event: any) => {},
  getPlayer = (
    player: HTMLAudioElement | null,
    dispatch: React.Dispatch<any>,
  ) => {},
  onClose = () => {},
}) => {
  const player = React.useRef<HTMLAudioElement | null>(null);
  const [visible, setVisibility] = React.useState(true);
  const handleClose = React.useCallback(() => {
    setVisibility(false);
    onClose();
  }, []);
  const theme: { [key: string]: any } = useTheme();
  const playerColors: IAudioPlayerColors = getColors(theme, variation);
  const componentsOrder =
    order === AudioPlayerComponentsOrder.standard ? 'unset' : '-1';
  const componentStyles = { width, height, playerColors, componentsOrder };
  const classes = useComponentStyles(componentStyles);
  const classNames: Partial<IAudioPlayerClassNameProps> =
    useStyles(componentStyles);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSingleTime = React.useMemo(() => time === TimeOption.single, [time]);
  const isTimePositionStart = React.useMemo(
    () => timePosition === TimePosition.start,
    [timePosition],
  );
  const [showCurrentTime, toggleTime] = React.useState(true);
  const toggleCurrentTime = React.useCallback(
    () => toggleTime((val) => !val),
    [toggleTime],
  );

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [
    _playAudio,
    _pauseAudio,
    _muteAudio,
    _unmuteAudio,
    _changeAudioVolume,
    _setPlayerDuration,
    _setPlayerTime,
    _audioEnded,
    _replayAudio,
    _changePlayerSlider,
    _setPlayerAutoplay,
    _loopAudio,
  ] = React.useMemo(() => {
    return populateDispatch(dispatch, player, ...actionCreators);
  }, [dispatch, player, actionCreators]);
  const handleAudioSliderChange = (event: object, progress: any) => {
    _changePlayerSlider(progress);
  };
  const handlePlayerTimeUpdate = () => {
    _setPlayerTime();
  };
  const handleAudioEnd = (event) => {
    _audioEnded();
    onFinished(event);
  };
  const onLoad = () => {
    if (player?.current?.duration === Infinity) {
      player.current.currentTime = 24 * 60 * 60;
      player.current.currentTime = 0;
    }
    _setPlayerDuration();
    getPlayer(player.current, dispatch);
    if (player?.current?.currentTime === 0) {
      if (player?.current?.autoplay || player?.current?.loop) {
        // @ts-ignore: no-empty
      } else {
        _pauseAudio();
      }
    }
  };

  React.useEffect(() => {
    if (player && player.current) {
      if (player.current.readyState > 3) {
        onLoad();
      }
      if (!player.current.autoplay && autoplay) {
        _setPlayerAutoplay();
      }
      if (isSafari) {
        player.current.load();
      }
      player.current.addEventListener('canplay', onLoad);
      player.current.addEventListener('timeupdate', handlePlayerTimeUpdate);
      player.current.addEventListener('ended', handleAudioEnd);
      player.current.addEventListener('pause', onPaused);
      player.current.addEventListener('play', onPlayed);
    }
    return () => {
      if (player && player.current) {
        player.current.removeEventListener('canplay', onLoad);

        player.current.removeEventListener(
          'timeupdate',
          handlePlayerTimeUpdate,
        );
        player.current.removeEventListener('ended', handleAudioEnd);
        player.current.removeEventListener('pause', onPaused);
        player.current.removeEventListener('play', onPlayed);
      }
    };
  }, [player, src]);

  React.useEffect(() => {
    if (player?.current && typeof muted === 'boolean') {
      if (muted) {
        _muteAudio();
      } else {
        _unmuteAudio();
      }
    }
  }, [muted]);

  if (debug) {
    // tslint:disable-next-line
    console.log('state', state);
    // tslint:disable-next-line
    console.log('player', player);
  }

  const handleLoop = () => {
    _loopAudio(!state.player.loop);
  };
  const mainContainerSpacing: GridSpacing = spacing
    ? spacing
    : isMobile
    ? 2
    : 3;
  const audioKey: string = Array.isArray(src) ? src[0] : src;
  const currentTimeComp = (
    <Grid item={true} className={cx(classes.commonContainer)}>
      <Typography
        className={classNames.progressTime}
        onClick={toggleCurrentTime}
      >
        {showCurrentTime
          ? getFormattedTime(state.player.current)
          : getFormattedTime(state.player.remaining, true)}
      </Typography>
    </Grid>
  );

  return visible ? (
    <Grid
      container={true}
      spacing={mainContainerSpacing}
      component={Paper}
      alignItems='center'
      className={cx(
        classes.root,
        classes[`elevation${elevation}`],
        {
          [classes.rounded]: !rounded,
        },
        classNames.root,
      )}
    >
      <audio ref={player} hidden={true} preload={preload} key={audioKey}>
        {Array.isArray(src) ? (
          src.map((srcLink, index) => <source key={index} src={srcLink} />)
        ) : (
          <source src={src} />
        )}
      </audio>
      {loop && (
        <Grid item={true} className={classes.commonContainer}>
          <Repeat
            fontSize='large'
            onClick={handleLoop}
            className={cx(
              {
                [classes.iconSelected]: state.player.loop,
                selected: state.player.loop,
                [classes.icon]: !state.player.loop,
              },
              classNames.loopIcon,
            )}
          />
        </Grid>
      )}
      <Grid item={true} className={classes.commonContainer}>
        <AudioPlayControl
          classNames={classNames}
          icons={icons}
          playerStatus={state.player.status}
          playerColors={playerColors}
          replayAudio={_replayAudio}
          pauseAudio={_pauseAudio}
          playAudio={_playAudio}
        />
      </Grid>
      {download && (
        <AudioDownloadsControl src={src} playerColors={playerColors} />
      )}
      {volume && (
        <AudioVolumeControl
          muted={muted}
          muteAudio={_muteAudio}
          unmuteAudio={_unmuteAudio}
          classNames={classNames}
          changeAudioVolume={_changeAudioVolume}
          volume={state.player.volume}
          playerColors={playerColors}
          icons={icons}
        />
      )}
      {displaySlider && (
        <Grid
          item={true}
          container={true}
          spacing={2}
          className={cx(classes.sliderContainerWrapper)}
        >
          {(!isSingleTime || isTimePositionStart) && currentTimeComp}
          <Grid item={true} className={classes.sliderContainer}>
            <Slider
              className={cx(classes.slider, classNames.mainSlider)}
              onChange={handleAudioSliderChange}
              value={state.player.progress}
            />
          </Grid>
          {!isSingleTime && (
            <Grid item={true} className={classes.commonContainer}>
              <Typography className={classNames.progressTime}>
                {getFormattedTime(state.player.duration)}
              </Typography>
            </Grid>
          )}
          {isSingleTime && !isTimePositionStart && currentTimeComp}
        </Grid>
      )}
      {displayCloseButton && (
        <AudioPlayerCloseButton
          onClose={handleClose}
          classNames={classNames}
          playerColors={playerColors}
          icons={icons}
        />
      )}
    </Grid>
  ) : null;
};

export default AudioPlayer;
