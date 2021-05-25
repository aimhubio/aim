import * as actionTypes from './actionTypes';

export function resetProgress() {
  return (dispatch) => {
    dispatch({ type: actionTypes.PROGRESS, progress: 5 });
  };
}

export function incProgress() {
  return (dispatch) => {
    dispatch({ type: actionTypes.INC_PROGRESS, incProgress: 20 });
  };
}

export function completeProgress() {
  return (dispatch) => {
    setTimeout(
      () => dispatch({ type: actionTypes.PROGRESS, progress: 200 }),
      100,
    );
  };
}
