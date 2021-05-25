import * as actionTypes from '../actions/actionTypes';

const initialState = {
  project: {
    tf_enabled: false,
    metrics: null,
    params: null,
  },
  isLoading: true,
  isUpdating: false,
};

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case actionTypes.HUB_PROJECT:
      return {
        ...state,
        project: {
          ...state.project,
          ...action.data,
        },
        isLoading: false,
      };

    case actionTypes.HUB_PROJECT_UPDATE_START:
      return {
        ...state,
        isUpdating: true,
      };

    case actionTypes.HUB_PROJECT_UPDATE:
      return {
        ...state,
        project: {
          ...state.project,
          ...action.data,
        },
      };

    case actionTypes.HUB_PROJECT_UPDATE_STATUS_DONE:
      return {
        ...state,
        isUpdating: false,
      };

    case actionTypes.HUB_PROJECT_NOT_FOUND:
      return {
        ...state,
        project: {},
        isLoading: false,
      };

    default:
      return state;
  }
}
