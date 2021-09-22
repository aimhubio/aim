export interface IModel<StateType> {
  init: () => void;
  destroy: () => void;
  getState: () => StateType | null;
  setState: (data: StateType) => void;
  subscribe: (
    evt: 'INIT' | 'UPDATE',
    fn: (data: StateType) => void,
  ) => { unsubscribe: () => void };
}
