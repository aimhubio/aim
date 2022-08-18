import createReact from 'zustand';
import { omit } from 'lodash-es';

import createVanilla from 'zustand/vanilla';

import { getParams } from 'services/api/base-explorer/projectApi';
import {
  IRunProgressObject,
  RunsSearchQueryParams,
} from 'services/api/base-explorer/runsApi';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import { IInstructionsState } from '../store/slices/instructionsSlice';
import createPipeline, { Pipeline, PipelineOptions } from '../pipeline';
import { GroupType, Order } from '../pipeline/grouping/types';
import { instructionsSelector } from '../store';
import { IEngineConfigFinal, PipelineStatusEnum } from '../types';
import { IQueryableData } from '../pipeline/adapter/processor';
import { PipelinePhasesEnum } from '../pipeline';

import {
  createDefaultBoxStateSlice,
  createQueryUISlice,
  createStateSlices,
  PreCreatedStateSlice,
} from './utils';
import { createGroupingsStateConfig } from './grouping';
import { createControlsStateConfig } from './controls';

export interface ProgressState extends IRunProgressObject {
  percent: number;
}

type ExplorerState = {
  initialized: boolean;
  instructions: IInstructionsState | object;
  sequenceName: SequenceTypesEnum | null;
  pipeline: {
    currentPhase: PipelinePhasesEnum;
    status: PipelineStatusEnum;
    progress?: ProgressState;
  };
  groupings?: {
    [key: string]: {
      orders: Order[];
      fields: string[];
    };
    // @ts-ignore
    currentValues: {
      [key: string]: {
        orders: Order[];
        fields: string[];
      };
    };
  };
  data: any;
  additionalData: any;
  foundGroups: any; // remove this
  queryableData: IQueryableData;
};

type ExplorerConfig = {
  sequenceName: SequenceTypesEnum;
  objectDepth: AimObjectDepths;
  useCache: boolean;
};

const initialProgressState: ProgressState = {
  matched: 0,
  trackedRuns: 0,
  percent: 0,
  checked: 0,
};

const initialState: ExplorerState = {
  initialized: false,
  sequenceName: null,
  instructions: {},
  pipeline: {
    currentPhase: PipelinePhasesEnum.Waiting,
    status: PipelineStatusEnum.NeverExecuted,
    progress: initialProgressState,
  },
  data: null,
  additionalData: null,
  foundGroups: null,
  queryableData: {},
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

export type QueryUIStateUnit = {
  simpleInput: string;
  advancedInput: string;
  selections: ISelectOption[];
  advancedModeOn: boolean;
};

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

  const stateSlicesResetMethods: any[] = [];

  const groupConfigs = createGroupingsStateConfig(config.grouping);
  const controlConfigs = createControlsStateConfig(config.controls);

  const styleAppliers = Object.keys(config.grouping || {}).map(
    (key: string) => {
      return config.grouping?.[key].styleApplier;
    },
  );

  // delete this later because has usage on another experiment (control resetting)
  const defaultApplications = Object.keys(config.grouping || {}).reduce(
    // @ts-ignore
    (acc: object, key: string) => {
      // @ts-ignore
      acc[key] = config.grouping?.[key].defaultApplications;
      return acc;
    },
    {},
  );

  generatedInitialStates['groupings'] = {
    ...groupConfigs.initialState,
  };

  generatedInitialStates['controls'] = {
    ...controlConfigs.initialState,
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
      const methods = elem.methods<any>(
        storeVanilla.setState,
        storeVanilla.getState,
      );
      acc[name] = {
        ...elem,
        methods,
      };
      return acc;
    },
    {},
  );
  /*  Slices Creation */

  // grouping
  const encapsulatedGroupProperties = Object.keys(groupConfigs.slices).reduce(
    (acc: { [key: string]: object }, name: string) => {
      const elem = groupConfigs.slices[name];
      const methods = elem.methods(
        storeVanilla.setState,
        storeVanilla.getState,
      );
      stateSlicesResetMethods.push(methods);
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

  // grouping
  const encapsulatedControlProperties = Object.keys(
    controlConfigs.slices,
  ).reduce((acc: { [key: string]: object }, name: string) => {
    const elem = controlConfigs.slices[name];
    const methods = elem.methods(storeVanilla.setState, storeVanilla.getState);
    stateSlicesResetMethods.push(methods);
    acc[name] = {
      ...elem,
      methods,
    };
    return acc;
  }, {});

  function resetConfigs() {
    Object.values(encapsulatedControlProperties).forEach(
      (controlProperties: any) => {
        controlProperties.methods.reset();
      },
    );
    Object.values(encapsulatedGroupProperties).forEach(
      (controlProperties: any) => {
        controlProperties.methods.reset();
      },
    );
    groupingMethods.reset();
    //@TODO: fix types
    // @ts-ignore
    encapsulatedEngineProperties.boxConfig.methods.reset();
    //@TODO: move to right place
    group(
      defaultApplications as {
        [key in GroupType]: { fields: string[]; orders: Order[] };
      },
    );
  }

  const storeReact = createReact(storeVanilla);

  function pipelineStatusCallback(status: PipelinePhasesEnum): void {
    // @TODO add exception checking
    let pipelineStatusOnEngine: PipelineStatusEnum =
      PipelineStatusEnum.NeverExecuted;

    if (
      status === PipelinePhasesEnum.Fetching ||
      status === PipelinePhasesEnum.Adopting
    ) {
      pipelineStatusOnEngine = PipelineStatusEnum.Executing;
    }

    if (status === PipelinePhasesEnum.Waiting) {
      pipelineStatusOnEngine = PipelineStatusEnum.Succeed;
    }

    storeVanilla.setState({
      pipeline: {
        ...storeVanilla.getState().pipeline,
        currentPhase: status,
        status: pipelineStatusOnEngine,
      },
    });
  }

  function pipelineRequestProgressCallback(progress: IRunProgressObject) {
    // @TODO keep everything with pipeline slice ion store, related to pipeline
    const progressState: ProgressState = {
      ...progress,
      percent: progress.trackedRuns
        ? Math.ceil((progress.checked / progress.trackedRuns) * 100)
        : 0,
    };

    storeVanilla.setState({
      pipeline: {
        ...storeVanilla.getState().pipeline,
        progress: progressState,
      },
    });
  }

  function createPipelineInstance(config: ExplorerConfig) {
    const useCache = config.useCache || false;

    const pipelineOptions: PipelineOptions = {
      sequenceName: config.sequenceName,
      callbacks: {
        statusChangeCallback: pipelineStatusCallback,
        requestProgressCallback: pipelineRequestProgressCallback,
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
    const { groupings } = storeVanilla.getState();
    const currentValues = groupings?.currentValues || {};

    const groupOptions = Object.keys(currentValues || {}).map(
      (key: string) => ({
        type: key as GroupType,
        fields: currentValues[key].fields,
        orders: currentValues[key].orders,
      }),
    );
    lastQuery = {
      query: { params },
    };

    // @ts-ignore
    const res = await pipeline.execute({
      query: {
        params,
        ignoreCache: true,
      },
      group: groupOptions,
    });
    const { additionalData, data, queryableData, foundGroups } = res;

    storeVanilla.setState({
      data,
      additionalData,
      queryableData,
      foundGroups,
    });
  }

  async function group(
    config: {
      [key in GroupType]: { fields: string[]; orders: Order[] };
    },
  ) {
    groupingMethods.update(config);

    type OriginalGroupConfig = {
      type: GroupType;
      fields: string[];
      orders: Order[];
    };

    const groupConfig: OriginalGroupConfig[] = [];

    // @ts-ignore

    Object.keys(config).forEach((key: string) => {
      const groupConf: OriginalGroupConfig = {
        type: key as GroupType,
        fields: config[key as GroupType].fields,
        orders: config[key as GroupType].orders,
      };
      config[key as GroupType].fields.length && groupConfig.push(groupConf);
    });

    const result = await pipeline.execute({
      query: lastQuery.query,
      group: groupConfig,
    });

    const { data, additionalData, foundGroups } = result;

    storeVanilla.setState({
      data,
      additionalData,
      foundGroups,
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
    return getParams({ sequence });
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
    sequenceNameSelector: (state: any) => state.sequenceName,
    // make separate pipeline key
    pipelineStatusSelector: (state: any): PipelineStatusEnum =>
      state.pipeline.status,
    pipelineProgressSelector: (state: any): ProgressState =>
      state.pipeline.progress,
    resetPipelineProgress: (): void => {
      storeVanilla.setState({
        pipeline: {
          ...storeVanilla.getState().pipeline,
          progress: initialProgressState,
        },
      });
    },
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
      reset: groupingMethods.reset,
    },
    // controls
    controls: {
      ...encapsulatedControlProperties,
    },
    // instructions
    instructions: {
      dataSelector: instructionsSelector,
    },
    resetConfigs,
    styleAppliers,
    // pipeline result result
    dataSelector: (state: any) => state.data,
    additionalDataSelector: (state: any) => state.additionalData,
    foundGroupsSelector: (state: any) => state.foundGroups,
    queryableDataSelector: (state: any) => state.queryableData,
  };
}

export default createEngine;
