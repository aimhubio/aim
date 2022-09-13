import { isEmpty, omit } from 'lodash-es';

import {
  IRunProgressObject,
  RunsSearchQueryParams,
} from 'modules/core/api/runsApi';
import createPipeline, {
  GroupType,
  Order,
  PipelineOptions,
  PipelinePhasesEnum,
} from 'modules/core/pipeline';

import { PipelineStatusEnum, ProgressState } from '../types';
import { SequenceTypesEnum } from '../../../../types/core/enums';

import createState, {
  CurrentGrouping,
  IPipelineState,
  PipelineStateBridge,
} from './state';

export interface IPipelineEngine<TObject, TStore> {
  state: {
    pipeline: IPipelineState<TObject>;
  };
  engine: {
    search: (params: RunsSearchQueryParams) => void;
    group: (config: CurrentGrouping) => void;
    getSequenceName: () => SequenceTypesEnum;
    destroy: () => void;
  } & Omit<PipelineStateBridge<TObject, TStore>, 'selectors'> &
    PipelineStateBridge<TObject, TStore>['selectors'];
}

function createPipelineEngine<TStore, TObject>(
  store: any,
  options: Omit<PipelineOptions, 'callbacks'>,
): IPipelineEngine<TObject, TStore> {
  const state = createState<TStore, TObject>(store);

  /**
   * Function to get notified by pipeline which phase is executing
   * @param {PipelinePhasesEnum} phase
   */
  function statusChangeCallback(phase: PipelinePhasesEnum) {
    // @TODO add exception checking
    let currentStatus: PipelineStatusEnum = state.getStatus();

    if (phase === PipelinePhasesEnum.Grouping) {
      currentStatus = PipelineStatusEnum.Processing;
    }
    if (
      [
        PipelinePhasesEnum.Fetching,
        PipelinePhasesEnum.Decoding,
        PipelinePhasesEnum.Adopting,
      ].includes(phase)
    ) {
      currentStatus = PipelineStatusEnum.Executing;
    }

    if (phase === PipelinePhasesEnum.Waiting) {
      currentStatus = PipelineStatusEnum.Succeed;
    }

    state.changeCurrentPhaseOrStatus(currentStatus, phase);
  }

  /**
   * Function to get the progress of query
   * @param {IRunProgressObject} progress
   */
  function requestProgressCallback(progress: IRunProgressObject) {
    // @TODO keep everything with pipeline slice in store, related to pipeline
    const progressState: ProgressState = {
      ...progress,
      percent: progress.trackedRuns
        ? Math.ceil((progress.checked / progress.trackedRuns) * 100)
        : 0,
    };

    state.setProgress(progressState);
  }

  const pipelineOptions: PipelineOptions = {
    ...options,
    callbacks: {
      statusChangeCallback,
      requestProgressCallback,
    },
  };

  const pipeline = createPipeline(pipelineOptions);

  /**
   * Function search, used to execute pipeline started from search
   * @example
   *    pipeline.engine.search({ q: "run.hparams.batch_size>32"})
   * @param {RunsSearchQueryParams} params
   */
  function search(params: RunsSearchQueryParams): void {
    const currentGroupings = state.getCurrentGroupings();

    const groupOptions = Object.keys(currentGroupings).map((key: string) => ({
      type: key as GroupType,
      fields: currentGroupings[key].fields,
      orders: currentGroupings[key].orders,
    }));

    // @TODO complete response typings
    pipeline
      .execute({
        query: {
          params,
          ignoreCache: true,
        },
        group: groupOptions,
      })
      .then((res) => {
        // collect result
        const { additionalData, data, queryableData, foundGroups } = res;

        // save to state
        state.setResult(data, foundGroups, queryableData, additionalData);
        state.changeCurrentPhaseOrStatus(
          isEmpty(data) ? PipelineStatusEnum.Empty : state.getStatus(),
        );
      })
      .catch((ex: unknown) => {});
  }

  /**
   * Function group, used to execute pipeline started from group
   *      using cache for query and adapter phases, and run only grouping
   * @example
   *     pipeline.engine.group(config)
   * @param {CurrentGrouping} config
   */
  function group(config: CurrentGrouping): void {
    state.setCurrentGroupings(config);

    // @TODO complete typings
    const groupConfig: {
      type: GroupType;
      fields: string[];
      orders: Order[];
    }[] = [];

    Object.keys(config).forEach((key: string) => {
      const groupConf: {
        type: GroupType;
        fields: string[];
        orders: Order[];
      } = {
        type: key as GroupType,
        fields: config[key as GroupType].fields,
        orders: config[key as GroupType].orders,
      };
      config[key as GroupType].fields.length && groupConfig.push(groupConf);
    });

    pipeline
      .execute({
        query: {
          params: state.getCurrentQuery(),
        },
        group: groupConfig,
      })
      .then((res) => {
        const { data, additionalData, foundGroups } = res;
        state.setResult(data, additionalData, foundGroups);
      });
  }

  return {
    state: {
      pipeline: state.initialState,
    },
    engine: {
      ...omit(state, ['selectors']),
      ...state.selectors,
      getSequenceName: () => options.sequenceName,
      search,
      group,
      destroy: () => {
        pipeline.clearCache();
        // pipeline.destroy();
      },
    },
  };
}

export default createPipelineEngine;
