import { RequestOptions } from 'https';
import create from 'zustand';

export interface IResourceState<T> {
  data: T | null;
  loading: boolean;
  error: any;
}

function createResource<T, GetterArgs = RequestOptions>(getter: any) {
  const state = create<IResourceState<T>>(() => ({
    data: null,
    loading: true,
    error: null,
  }));

  async function fetchData(args?: GetterArgs) {
    state.setState({ loading: true });
    const data = await getter(args);
    state.setState({ data, loading: false });
  }
  return { fetchData, state };
}

export default createResource;
