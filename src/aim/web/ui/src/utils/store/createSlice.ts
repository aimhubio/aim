export type GetState<T> = () => T;

export type SetState<T> = (state: (state: T) => T) => T;

export interface SliceMethods<TState> {
  update: (newValue: Partial<TState>) => void;
  reset: () => void;
}

export type StateSelector<TState, TStore> = (store: TStore) => TState;

/**
 * Creates a zustand store slice with name
 */
function createSlice<IState, IMethods>(
  initialState: IState,
  generateMethods: (set: SetState<IState>, get: GetState<IState>) => IMethods,
): (set: SetState<IState>, get: GetState<IState>) => IState & IMethods {
  // @ts-ignore
  return (
    set: SetState<IState>,
    get: GetState<IState>,
  ): (IState & IMethods) | Record<string, IState & IMethods> => {
    const methods = generateMethods(set, get);

    return {
      ...initialState,
      ...methods,
    };
  };
}

export default createSlice;
