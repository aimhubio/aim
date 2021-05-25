import * as actionTypes from '../actions/actionTypes';

const initialState = {
  loadProgress: 0,
};

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case actionTypes.PROGRESS:
      return Object.assign({}, state, { loadProgress: action.progress });

    case actionTypes.INC_PROGRESS:
      let newValue = state.loadProgress + action.incProgress;
      if (newValue > 100) {
        newValue = 100;
      }

      return Object.assign({}, state, { loadProgress: newValue });

    default:
      return state;
  }
}
