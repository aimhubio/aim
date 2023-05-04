import { RequestOptions } from 'https';
import create from 'zustand';

export interface IResourceState<T> {
  data: T | null;
  loading: boolean;
  error: any;
}

const defaultState = {
  data: null,
  loading: true,
  error: null,
};

function createResource<T, GetterArgs = RequestOptions | any>(getter: any) {
  const state = create<IResourceState<T>>(() => defaultState);

  async function fetchData(args?: GetterArgs) {
    state.setState({ loading: true });
    const data = await getter(args);
    state.setState({ data, loading: false });
  }
  function destroy() {
    state.destroy();
    state.setState(defaultState, true);
  }
  return { fetchData, state, destroy };
}

export default createResource;
