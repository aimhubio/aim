import { IModel } from '../../types/services/models/model';

function createModel(initialState: unknown): IModel {
  let state: unknown = null;
  const subscriptions: { [key: string]: { (data: unknown): void }[] } = {
    INIT: [],
    UPDATE: [],
  };
  return {
    init: () => {
      state = Object.assign({}, initialState);
      (subscriptions.INIT || []).forEach((fn) => fn(initialState));
    },
    getState: () => state,
    setState: (stateUpdate: unknown) => {
      Object.assign(state, stateUpdate);
      (subscriptions.UPDATE || []).forEach((fn) => fn(stateUpdate));
    },
    subscribe: (evt, fn) => {
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
