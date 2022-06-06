import { EngineStoreReservedSliceKeys, StoreSliceCreator } from '../types';

const defaultSlices = {
  box: {
    initialState: {
      width: 150,
      height: 150,
      gap: 20,
    },
  },
  query: {
    initialState: {
      simpleQuery: '',
      advancedInput: '',
      advancedModeOn: false,
    },
  },
};

function createBoxConfigSlice() {}

export default createBoxConfigSlice;
