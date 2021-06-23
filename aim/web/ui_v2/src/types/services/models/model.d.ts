export interface IModel {
  init: () => void;
  getState: () => unknown;
  setState: (data: unknown) => void;
  subscribe: (evt: 'INIT' | 'UPDATE', fn: (data: unknown) => void) => { unsubscribe: () => void };
}
