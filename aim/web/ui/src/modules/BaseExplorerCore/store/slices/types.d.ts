import { SequenceTypesEnum } from 'types/core/enums';

export enum ExplorerStatuses {
  fetching_instructions = 1,
  waiting = 2,
  fetching = 4,
  decoding = 5,
  visualizing = 4,
}

/** INSTRUCTIONS SLICE */
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

/** EXPLORER SLICE */
export interface IExplorerSliceState {
  sequenceName: SequenceTypesEnum | unknown;
  instructions: IInstructionsState; // from fetch project
}

export type IExplorerSliceMethods = {
  initialize: (sequenceName: SequenceTypesEnum) => void;
};

/** VISUALIZATIONS SLICE */
