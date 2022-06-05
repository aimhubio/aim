import { Pipeline } from 'modules/BaseExplorerCore/pipeline';

import { SequenceTypesEnum } from 'types/core/enums';

import createSlice, { SetState, GetState } from 'utils/store/createSlice';

import { removeExampleTypesFromProjectData } from '../../helpers';

import {
  ExplorerStatuses,
  IExplorerSliceMethods,
  IExplorerSliceState,
} from './types';

const initialState: IExplorerSliceState = {
  sequenceName: null,
  instructions: {
    queryable_data: null,
    project_sequence_info: null,
  },
};

let pipeline: Pipeline | null;

function createPipeline(name: string) {
  if (!pipeline) {
    // pipeline = new Pipeline('Base');
  }
}

function generateMethods(
  set: SetState<IExplorerSliceState>,
  get: GetState<IExplorerSliceState>,
): IExplorerSliceMethods {
  async function initialize(sequenceName: SequenceTypesEnum) {
    set((state) => ({
      ...state,
      status: ExplorerStatuses.fetching_instructions,
    }));

    console.group('===== fetching instructions');

    // const instructions = await getProjectParams([explorerType]);
    const instructions = { test: 'test' };

    console.log(instructions);
    console.groupEnd();

    set((state) => ({
      ...state,
      status: ExplorerStatuses.waiting,
      instructions: normalizeProjectData(instructions),
    }));
  }

  function normalizeProjectData(data: any) {
    return {
      ...data,
      params: removeExampleTypesFromProjectData(data.params),
    };
  }

  function executePipeline(params: any) {
    // const { explorerType } = get();
    // set((state) => ({
    //   ...state,
    //   status: ExplorerStatuses.executing_pipeline,
    // }));
    //
    // // set status of explorer
    // createPipeline(`${explorerType} Pipeline`);
    //
    // pipeline?.execute(params, (data: any) => {
    //   set((state) => ({
    //     ...state,
    //     sequence: data,
    //     status: ExplorerStatuses.visualizing,
    //   }));
    // });
  }

  function searchSequence({ query, context }: { query: any; context: any }) {
    // const { explorerType } = get();
    // // { query: { type } }
    // executePipeline({
    //   query: {
    //     type: explorerType,
    //     // query: { query, context } //@TODO add generation logic here
    //   },
    // });
  }

  function grouping(params: any) {
    // set((state) => ({
    //   ...state,
    //   status: ExplorerStatuses.executing_pipeline,
    // }));
    //
    // pipeline?.grouping(params, (data: any) => {
    //   set((state) => ({
    //     ...state,
    //     sequence: data,
    //     status: ExplorerStatuses.visualizing,
    //   }));
    // });
  }

  const methods: IExplorerSliceMethods = {
    initialize,
  };

  return methods;
}

const sliceCreator = createSlice<IExplorerSliceState, IExplorerSliceMethods>(
  initialState,
  generateMethods,
);

export default sliceCreator;
