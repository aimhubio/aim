import { IModel } from 'types/services/models/model';

function createModel<StateType>(initialState: StateType): IModel<StateType> {
  let state: StateType | null = null;
  const subscriptions: { [key: string]: { (data: StateType): void }[] } = {
    INIT: [],
    UPDATE: [],
  };
  return {
    init: () => {
      state = Object.assign({}, initialState);
      (subscriptions.INIT || []).forEach((fn) => fn(initialState));
    },
    destroy: () => {
      subscriptions.INIT = [];
      subscriptions.UPDATE = [];
      state = null;
    },
    getState: () => Object.assign({}, state),
    setState: (stateUpdate: StateType) => {
      state = Object.assign(state || initialState, stateUpdate);
      (subscriptions.UPDATE || []).forEach((fn) => fn(stateUpdate));
    },
    subscribe: (evt: 'INIT' | 'UPDATE', fn: (data: StateType) => void) => {
      subscriptions[evt].push(fn);

      return {
        unsubscribe: () => {
          subscriptions[evt].splice(subscriptions[evt].indexOf(fn) >>> 0, 1);
        },
      };
    },
  };
}

export default createModel;
