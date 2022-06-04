import createReact from 'zustand';

import createVanilla from 'zustand/vanilla';

import { getParams } from 'services/api/base-explorer/projectApi';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import createPipeline, { Pipeline, PipelineOptions } from '../pipeline';
import { IInstructionsState } from '../store/slices/instructionsSlice';
import { RunsSearchQueryParams } from '../../../services/api/base-explorer/runsApi';
import { removeExampleTypesFromProjectData } from '../helpers';

type ExplorerState = {
  instructions: IInstructionsState | object;
  sequenceName: SequenceTypesEnum | null;
  pipeline: {
    status: string;
  };
  data: any;
  additionalData: any;
};

type ExplorerConfig = {
  sequenceName: SequenceTypesEnum;
  objectDepth: AimObjectDepths;
  useCache: boolean;
};

const initialState: ExplorerState = {
  sequenceName: null,
  instructions: {},
  pipeline: {
    status: 'initial',
  },
  data: null,
  additionalData: null,
};

let pipeline: Pipeline;

function generateEngine() {
  const storeVanilla = createVanilla((set, get) => ({
    ...initialState,
  }));

  const storeReact = createReact(storeVanilla);

  function pipelineStatusCallback(status: string) {
    storeVanilla.setState({ pipeline: { status } });
  }

  function createPipelineInstance(config: ExplorerConfig) {
    const useCache = config.useCache || false;

    const pipelineOptions: PipelineOptions = {
      sequenceName: config.sequenceName,
      callbacks: {
        statusChangeCallback: pipelineStatusCallback,
      },
      adapter: {
        objectDepth: config.objectDepth,
        useCache,
      },
      modifier: {
        useCache,
      },
      query: {
        useCache,
      },
    };

    pipeline = createPipeline(pipelineOptions);
  }

  async function search(params: RunsSearchQueryParams) {
    const { data, additionalData } = await pipeline.execute({
      query: {
        params,
      },
    });

    storeVanilla.setState({ data, additionalData });
  }
  async function group() {}

  function initialize(config: ExplorerConfig) {
    createPipelineInstance(config);
    storeVanilla.setState({ sequenceName: config.sequenceName });

    // getProjects
    getInstructions(config.sequenceName).then((instructions) => {
      storeVanilla.setState({
        instructions: {
          queryable_data: instructions,
          // @ts-ignore
          project_sequence_info: instructions[config.sequenceName],
        },
      });
    });
  }

  async function getInstructions(sequence: SequenceTypesEnum) {
    try {
      const params = await getParams({ sequence });
      return removeExampleTypesFromProjectData(params);
    } catch (e) {
      // @TODO exception handling
    }
  }

  return {
    useStore: storeReact,
    destroy: storeVanilla.destroy,
    getState: storeVanilla.getState,
    setState: storeVanilla.setState,
    initialize,
    search,

    // instructionsSelector
    instructionsSelector: (state: any) => state.instructions,

    // explorer
    dataSelector: (state: any) => state.data,
    sequenceNameSelector: (state: any) => state.sequenceName,
    additionalDataSelector: (state: any) => state.additionalData,
    pipelineStatusSelector: (state: any) => state.pipeline.status,
  };
}

export default generateEngine;
