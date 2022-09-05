import create from 'zustand';

export interface IResourceState<T> {
  data: T[];
  loading: boolean;
  error: any;
}

function createResource<T, GetterArgs = unknown>(getter: any) {
  const state = create<IResourceState<T>>(() => ({
    data: [],
    loading: true,
    error: null,
  }));

  async function fetchData(args?: GetterArgs) {
    const data = await getter(args).call((detail: any) => {});
    state.setState({ data, loading: false });
  }
  return { fetchData, state };
}

export default createResource;
