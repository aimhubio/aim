export type State = {
  config?: Record<string, any>;
  table?: Record<string, any>;
};

export interface IModel<StateType extends State> {
  init: () => void;
  destroy: () => void;
  getState: () => StateType;
  setState: (data: Partial<StateType> | StateType | unknown | any) => void;
  subscribe: (
    evt: 'INIT' | 'UPDATE',
    fn: (data: StateType) => void,
  ) => { unsubscribe: () => void };
}
