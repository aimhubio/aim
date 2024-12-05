// @ts-nocheck
import {
  PLAYER_AUDIO_ENDED,
  PLAYER_AUTOPLAY,
  PLAYER_LOOP,
  PLAYER_REPLAY,
  PLAYER_SET_DURATION,
  PLAYER_SET_TIME,
  PLAYER_SLIDER_MOVED,
  PLAYER_STATUS_PAUSE,
  PLAYER_STATUS_PLAY,
  PLAYER_VOLUME_CHANGE,
  PLAYER_VOLUME_STATUS_MUTE,
  PLAYER_VOLUME_STATUS_UNMUTE,
} from './actions';
import PLAYER from './player';

export default function reducer(state, action) {
  switch (action.type) {
    case PLAYER_STATUS_PLAY:
      return {
        player: {
          ...state.player,
          status: PLAYER.STATUS.PLAY,
        },
      };
    case PLAYER_STATUS_PAUSE:
      return {
        player: {
          ...state.player,
          status: PLAYER.STATUS.PAUSE,
        },
      };
    case PLAYER_VOLUME_STATUS_UNMUTE:
      return {
        player: {
          ...state.player,
          volume: {
            ...state.player.volume,
            status: PLAYER.VOLUME.STATUS.UNMUTE,
          },
        },
      };
    case PLAYER_VOLUME_STATUS_MUTE:
      return {
        player: {
          ...state.player,
          volume: {
            ...state.player.volume,
            status: PLAYER.VOLUME.STATUS.MUTE,
          },
        },
      };
    case PLAYER_VOLUME_CHANGE:
      return {
        player: {
          ...state.player,
          volume: {
            status: PLAYER.VOLUME.STATUS.UNMUTE,
            value: action.volumeValue,
          },
        },
      };
    case PLAYER_SET_DURATION:
      return {
        player: {
          ...state.player,
          duration: action.duration,
        },
      };
    case PLAYER_SET_TIME:
      return {
        player: {
          ...state.player,
          progress: action.progress,
          remaining: action.remaining,
          current: action.current,
        },
      };
    case PLAYER_SLIDER_MOVED:
      return {
        player: {
          ...state.player,
          progress: action.progress,
          remaining: action.remaining,
          current: action.current,
        },
      };
    case PLAYER_AUDIO_ENDED:
      return {
        player: {
          ...state.player,
          status: PLAYER.STATUS.STOP,
        },
      };
    case PLAYER_REPLAY:
      return {
        player: {
          ...state.player,
          status: PLAYER.STATUS.PLAY,
          progress: 0,
          current: 0,
        },
      };
    case PLAYER_AUTOPLAY:
      return {
        player: {
          ...state.player,
          status: PLAYER.STATUS.PLAY,
          autoplay: true,
        },
      };
    case PLAYER_LOOP:
      return {
        player: {
          ...state.player,
          loop: action.loop,
        },
      };
    default:
      return state;
  }
}
