import { SequenceTypesEnum } from 'types/core/enums';

import createSlice, { GetState, SetState } from 'utils/store/createSlice';

/**
 * the state type useful for initial data for explorer
 */
export interface IInstructionsState {
  /**
   * queryable data
   */
  queryable_data: any;

  /**
   * select_form data
   */
  project_sequence_info: any;
}

// methods for the instruction slice
export type IInstructionsSliceMethods = {
  getProjectsData: (sequenceName: SequenceTypesEnum) => void;
};

export const initialState: IInstructionsState = {
  queryable_data: null,
  project_sequence_info: null,
};

const sliceName = 'instructions';

function generateMethods(
  set: SetState<IInstructionsState>,
  get: GetState<IInstructionsState>,
): IInstructionsSliceMethods {
  async function getProjectsData(sequenceName: SequenceTypesEnum) {}

  return {
    getProjectsData,
  };
}

const sliceCreator = createSlice<IInstructionsState, IInstructionsSliceMethods>(
  initialState,
  generateMethods,
);
// create selector
export { sliceName };
// use in useStore
export default sliceCreator;
