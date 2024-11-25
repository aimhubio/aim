// @ts-nocheck
import { getCurrentTime, getProgress, getremainingTime } from './helpers';

const PLAYER_STATUS_PLAY = 'PLAYER_STATUS_PLAY';
const PLAYER_STATUS_PAUSE = 'PLAYER_STATUS_PAUSE';
const PLAYER_VOLUME_STATUS_UNMUTE = 'PLAYER_VOLUME_STATUS_UNMUTE';
const PLAYER_VOLUME_STATUS_MUTE = 'PLAYER_VOLUME_STATUS_MUTE';
const PLAYER_VOLUME_CHANGE = 'PLAYER_VOLUME_CHANGE';
const PLAYER_SET_DURATION = 'PLAYER_SET_DURATION';
const PLAYER_SET_TIME = 'PLAYER_SET_TIME';
const PLAYER_SLIDER_MOVED = 'PLAYER_SLIDER_MOVED';
const PLAYER_AUDIO_ENDED = 'PLAYER_AUDIO_ENDED';
const PLAYER_REPLAY = 'PLAYER_REPLAY';
const PLAYER_AUTOPLAY = 'PLAYER_AUTOPLAY';
const PLAYER_LOOP = 'PLAYER_LOOP';

function playAudio(dispatch, player) {
  return () => {
    if (player.current) {
      player.current.play();
    }
    return dispatch({ type: PLAYER_STATUS_PLAY });
  };
}
function pauseAudio(dispatch, player) {
  return () => {
    if (player.current) {
      player.current.pause();
    }
    dispatch({ type: PLAYER_STATUS_PAUSE });
  };
}
function muteAudio(dispatch, player) {
  return () => {
    if (player.current) {
      player.current.muted = true;
    }
    dispatch({ type: PLAYER_VOLUME_STATUS_MUTE });
  };
}
function unmuteAudio(dispatch, player) {
  return () => {
    if (player.current) {
      player.current.muted = false;
    }
    dispatch({ type: PLAYER_VOLUME_STATUS_UNMUTE });
  };
}
function changeAudioVolume(dispatch, player) {
  return (value: number) => {
    if (player.current) {
      player.current.volume = value > 0 ? value / 100 : 0;
      if (player.current.muted) {
        player.current.muted = false;
      }
    }
    dispatch({ type: PLAYER_VOLUME_CHANGE, volumeValue: value });
  };
}
function setPlayerDuration(dispatch, player) {
  return () => {
    dispatch({ type: PLAYER_SET_DURATION, duration: player.current.duration });
  };
}
function setPlayerTime(dispatch, player) {
  return () => {
    const progress = getProgress(
      player?.current?.currentTime,
      player?.current?.duration,
    );
    const remaining = getremainingTime(progress, player?.current?.duration);
    dispatch({
      type: PLAYER_SET_TIME,
      current: player?.current?.currentTime,
      remaining,
      progress,
    });
  };
}
function changePlayerSlider(dispatch, player) {
  return (progress: number) => {
    const currentTime = getCurrentTime(progress, player.current.duration);
    const remainingTime = getremainingTime(progress, player.current.duration);

    if (currentTime) {
      player.current.currentTime = currentTime;
    }
    dispatch({
      type: PLAYER_SLIDER_MOVED,
      progress,
      current: currentTime,
      remaining: remainingTime,
    });
  };
}
function audioEnded(dispatch) {
  return () => {
    dispatch({ type: PLAYER_AUDIO_ENDED });
  };
}
function replayAudio(dispatch, player) {
  return () => {
    if (player.current) {
      player.current.play();
    }
    dispatch({ type: PLAYER_REPLAY });
  };
}
function loopAudio(dispatch, player) {
  return (loop: boolean) => {
    if (player.current) {
      player.current.loop = loop;
    }
    dispatch({ type: PLAYER_LOOP, loop });
  };
}
function setPlayerAutoplay(dispatch, player) {
  return () => {
    if (player.current) {
      player.current.autoplay = true;
    }

    dispatch({ type: PLAYER_AUTOPLAY });
  };
}
const actionCreators = [
  playAudio,
  pauseAudio,
  muteAudio,
  unmuteAudio,
  changeAudioVolume,
  setPlayerDuration,
  setPlayerTime,
  audioEnded,
  replayAudio,
  changePlayerSlider,
  setPlayerAutoplay,
  loopAudio,
];

export {
  actionCreators,
  PLAYER_VOLUME_STATUS_UNMUTE,
  PLAYER_VOLUME_STATUS_MUTE,
  PLAYER_STATUS_PLAY,
  PLAYER_STATUS_PAUSE,
  PLAYER_VOLUME_CHANGE,
  PLAYER_SET_DURATION,
  PLAYER_SET_TIME,
  PLAYER_SLIDER_MOVED,
  PLAYER_AUDIO_ENDED,
  PLAYER_REPLAY,
  PLAYER_AUTOPLAY,
  PLAYER_LOOP,
};
