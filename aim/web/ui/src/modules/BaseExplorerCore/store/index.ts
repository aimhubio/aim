import create from 'zustand';

import explorerSlice from './slices/explorerSlice';
import { IExplorerSliceState } from './slices/types';

// Store
const useStore = create<IExplorerSliceState>((set, get) => ({
  // @ts-ignore
  ...explorerSlice(set, get),
}));

export const instructionsSelector = (state: IExplorerSliceState) =>
  state.instructions;

// useStore export
export default useStore;
