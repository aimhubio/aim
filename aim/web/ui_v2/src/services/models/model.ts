function createModel(initialState: unknown) {
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
    subscribe: (evt: 'INIT' | 'UPDATE', fn: { (data: unknown): void }) => {
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
