import createReact from 'zustand';
import { omit } from 'lodash-es';

import createVanilla from 'zustand/vanilla';

import { getParams } from 'services/api/base-explorer/projectApi';
import { RunsSearchQueryParams } from 'services/api/base-explorer/runsApi';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import createPipeline, { Pipeline, PipelineOptions } from '../pipeline';
import { IInstructionsState } from '../store/slices/instructionsSlice';
import { removeExampleTypesFromProjectData } from '../helpers';
import { GroupType, Order } from '../pipeline/grouping/types';
import { instructionsSelector } from '../store';
import { IEngineConfigFinal } from '../types';

import {
  createDefaultBoxStateSlice,
  createQueryUISlice,
  createStateSlices,
  PreCreatedStateSlice,
} from './utils';
import { createGroupingsStateConfig } from './grouping';

type ExplorerState = {
  initialized: boolean;
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
  initialized: false,
  sequenceName: null,
  instructions: {},
  pipeline: {
    status: 'initial',
  },
  data: null,
  additionalData: null,
};

let pipeline: Pipeline;

function createConfiguration(config: IEngineConfigFinal): {
  states: {
    names: string[];
    values: {
      [key: string]: PreCreatedStateSlice;
    };
  };
} {
  const defaultStates: {
    [key: string]: PreCreatedStateSlice;
  } = {};

  const defaultBoxConfig = config.defaultBoxConfig;

  defaultStates['boxConfig'] = createDefaultBoxStateSlice(defaultBoxConfig);
  defaultStates['queryUI'] = createQueryUISlice({
    simpleInput: '',
    advancedInput: '',
    selections: [],
    advancedModeOn: true,
  });

  const names = [
    ...Object.keys(defaultStates),
    ...Object.keys(config.states || {}),
  ];

  const customStates: {} = createStateSlices(config.states);

  const values = {
    ...defaultStates,
    ...customStates,
  };

  return {
    states: {
      names,
      values,
    },
  };
}

// CREATE ENGINE
function createEngine(config: IEngineConfigFinal) {
  const { states } = createConfiguration(config);

  const generatedInitialStates: { [key: string]: object } = states.names.reduce(
    (acc: { [key: string]: object }, name: string) => {
      acc[name] = states.values[name].initialState;
      return acc;
    },
    {},
  );

  const groupConfigs = createGroupingsStateConfig(config.grouping);

  generatedInitialStates['groupings'] = {
    ...groupConfigs.initialState,
  };

  // store creation
  const storeVanilla = createVanilla<ExplorerState>(() => ({
    ...initialState,
    ...generatedInitialStates,
  }));

  /*  Slices Creation */
  const encapsulatedEngineProperties = states.names.reduce(
    (acc: { [key: string]: object }, name: string) => {
      const elem: PreCreatedStateSlice = states.values[name];

      acc[name] = {
        ...elem,
        methods: elem.methods<any>(
          storeVanilla.setState,
          storeVanilla.getState,
        ),
      };
      return acc;
    },
    {},
  );
  /*  Slices Creation */

  const encapsulatedGroupProperties = Object.keys(groupConfigs.slices).reduce(
    (acc: { [key: string]: object }, name: string) => {
      const elem = groupConfigs.slices[name];
      acc[name] = {
        ...omit(elem, ['styleApplier']),
        methods: elem.methods(storeVanilla.setState, storeVanilla.getState),
      };
      return acc;
    },
    {},
  );

  const groupingMethods = groupConfigs.generateMethods(
    storeVanilla.setState,
    storeVanilla.getState,
  );

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
      grouping: {
        useCache,
      },
      query: {
        useCache,
      },
    };

    pipeline = createPipeline(pipelineOptions);
  }

  let lastQuery: any;

  async function search(params: RunsSearchQueryParams) {
    lastQuery = {
      query: params,
    };
    const { data, additionalData } = await pipeline.execute({
      query: {
        params,
      },
      group: {
        columns: [],
      },
    });

    console.log(additionalData);

    storeVanilla.setState({ data, additionalData });
  }

  async function group(
    config: {
      [key: string]: { fields: string[]; orders: Order[] };
    } = {},
  ) {
    groupingMethods.update(config);
    // const result = await pipeline.execute({
    //   query: lastQuery,
    //   group: {
    //     [GroupType.COLUMN]: [
    //       {
    //         field: 'run.hash',
    //         order: Order.ASC,
    //       },
    //       {
    //         field: 'run.name',
    //         order: Order.DESC,
    //       },
    //     ],
    //   },
    // });
    //
    // storeVanilla.setState({
    //   data: result.data,
    //   additionalData: result.additionalData,
    // });
  }

  function initialize() {
    createPipelineInstance({
      objectDepth: config.adapter.objectDepth,
      sequenceName: config.sequenceName,
      useCache: !!config.useCache,
    });

    const { initialized } = storeVanilla.getState();

    // getProjects
    !initialized && // @TODO check is this need,  Cache by sidebar click
      getInstructions(config.sequenceName)
        .then((instructions) => {
          storeVanilla.setState({
            initialized: true,
            instructions: {
              queryable_data: instructions,
              // @ts-ignore
              project_sequence_info: instructions[config.sequenceName],
            },
          });
        })
        .catch(); // @TODO exception handling
  }

  async function getInstructions(sequence: SequenceTypesEnum) {
    const params = await getParams({ sequence });
    return removeExampleTypesFromProjectData(params);
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

    engineStatusSelector: (state: ExplorerState) => ({
      initialized: state.initialized,
    }),
    // modifications
    group,
    ...encapsulatedEngineProperties, // final

    // groupings
    groupings: {
      ...encapsulatedGroupProperties,
      currentValuesSelector: groupConfigs.currentValuesSelector,
    },
    // instructions
    instructions: {
      dataSelector: instructionsSelector,
    },
  };
}

export default createEngine;
