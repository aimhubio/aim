import createReact from 'zustand';

import createVanilla from 'zustand/vanilla';

import { getParams } from 'services/api/base-explorer/projectApi';
import { RunsSearchQueryParams } from 'services/api/base-explorer/runsApi';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import { GetState, SetState } from 'utils/store/createSlice';

import createPipeline, { Pipeline, PipelineOptions } from '../pipeline';
import { IInstructionsState } from '../store/slices/instructionsSlice';
import { removeExampleTypesFromProjectData } from '../helpers';
import { GroupType, Order } from '../pipeline/grouping/types';
import { instructionsSelector } from '../store';
import { GenerateStoreMethods } from '../types';

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

export interface IEngineConfigFinal {
  useCache?: boolean;
  sequenceName: SequenceTypesEnum;
  adapter: {
    objectDepth: AimObjectDepths;
  };
  grouping?: {};
  defaultBoxConfig: {
    width: number;
    height: number;
    gap: number;
  };
  styleAppliers?: {
    [key: string]: Function;
  };
  states?: {
    [name: string]: {
      initialState: object;
    };
  };
}

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

function createStateSlices(
  states: {
    [name: string]: {
      initialState: object;
    };
  } = {},
) {
  const createdStates: { [key: string]: object } = {};

  Object.keys(states).forEach((name: string) => {
    // @TODO check reserved keys, is properties are valid and throw exception
    const { initialState } = states[name];

    createdStates[name] = createSliceState(initialState, name);
  });

  return createdStates;
}

function createDefaultBoxStateSlice(config: {
  width: number;
  height: number;
  gap: number;
}) {
  const initialBoxConfig = config;
  const boxConfigSelector = (state: any) => state.boxConfig;

  const generateBoxConfigMethods = <TS extends Function, TG extends Function>(
    set: TS,
    get: TG,
  ) => {
    function update(newBoxConfig: {
      width?: number;
      height?: number;
      gap?: number;
    }) {
      const updatedConfig = {
        // @ts-ignore
        ...get().boxConfig,
        ...newBoxConfig,
      };

      set({
        boxConfig: updatedConfig,
      });
    }

    function reset() {
      set({
        boxConfig: initialBoxConfig,
      });
    }
    return { update, reset };
  };

  return {
    initialState: initialBoxConfig,
    stateSelector: boxConfigSelector,
    methods: generateBoxConfigMethods,
  };
}

function createSliceState(initialState: object, name: string) {
  const stateSelector = (state: any) => state[name];

  const generateMethods = <TS extends Function, TG extends Function>(
    set: TS,
    get: TG,
  ) => {
    function update(newState: object) {
      const updatedState = {
        // @ts-ignore
        ...get()[name],
        ...newState,
      };

      set({
        [name]: updatedState,
      });
    }

    function reset() {
      set({
        [name]: initialState,
      });
    }
    return { update, reset };
  };

  return {
    initialState,
    stateSelector,
    methods: generateMethods,
  };
}

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
    advancedModeOn: false,
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

// QUERY SLICE
export type QueryUIStateUnit = {
  simpleInput: string;
  advancedInput: string;
  selections: ISelectOption[];
  advancedModeOn: boolean;
};

type PreCreatedStateSlice = {
  initialState: object;
  stateSelector: Function;
  methods: GenerateStoreMethods;
};

function createQueryUISlice(
  initialState: QueryUIStateUnit,
): PreCreatedStateSlice {
  const selector = (state: any) => state.queryUI;

  const generateMethods: GenerateStoreMethods = <T>(
    set: SetState<T>,
    get: GetState<T>,
  ) => {
    function update(newState: QueryUIStateUnit) {
      const updated = {
        // @ts-ignore
        ...get().queryUI,
        ...newState,
      };

      set({
        // @ts-ignore
        queryUI: updated,
      });
    }

    function reset() {
      set({
        // @ts-ignore
        queryUI: { ...initialState },
      });
    }

    return { update, reset };
  };

  return {
    methods: generateMethods,
    initialState,
    stateSelector: selector,
  };
}
// QUERY SLICE

// CREATE ENGINE
function createEngine(config: IEngineConfigFinal) {
  const { states } = createConfiguration(config);
  console.log('pre created states --> ', states);

  const generatedInitialStates: { [key: string]: object } = states.names.reduce(
    (acc: { [key: string]: object }, name: string) => {
      acc[name] = states.values[name].initialState;
      return acc;
    },
    {},
  );

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

    storeVanilla.setState({ data, additionalData });
  }

  async function group() {
    const result = await pipeline.execute({
      query: lastQuery,
      group: {
        [GroupType.COLUMN]: [
          {
            field: 'run.hash',
            order: Order.ASC,
          },
          {
            field: 'run.name',
            order: Order.DESC,
          },
        ],
      },
    });

    storeVanilla.setState({
      data: result.data,
      additionalData: result.additionalData,
    });
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
            sequenceName: config.sequenceName,
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
    return params;
  }

  console.log(encapsulatedEngineProperties);

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

    ...encapsulatedEngineProperties,

    // instructions
    instructions: {
      dataSelector: instructionsSelector,
    },
  };
}

export default createEngine;
