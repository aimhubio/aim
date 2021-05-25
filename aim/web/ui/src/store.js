import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import defaultReducer from './reducers';
import projectReducer from './reducers/project';

let store;
export function configureStore() {
  store = createStore(
    combineReducers({
      default: defaultReducer,
      project: projectReducer,
    }),
    applyMiddleware(thunk),
  );
}
configureStore();

export default store;
