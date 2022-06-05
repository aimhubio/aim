export type GetState<T> = () => T;

export type SetState<T> = (state: (state: T) => T) => T;

/**
 * Creates a zustand store slice with name
 */
export function createSlice<IState, IMethods>(
  initialState: IState,
  generateMethods: (set: SetState<IState>, get: GetState<IState>) => IMethods,
  name?: string,
) {
  return (set: SetState<IState>, get: GetState<IState>) => {
    const methods = generateMethods(set, get);
    if (name) {
      return {
        [name]: {
          ...initialState,
          ...methods,
        },
      };
    }

    return {
      ...initialState,
      ...methods,
    };
  };
}
