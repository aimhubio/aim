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

import createState, { CurrentGrouping } from './state';

function createPipelineEngine<TStore, TObject>(
  store: any,
  options: Omit<PipelineOptions, 'callbacks'>,
) {
  const state = createState<TStore, TObject>(store);

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

  function requestProgressCallback(progress: IRunProgressObject) {
    // @TODO keep everything with pipeline slice ion store, related to pipeline
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
      ...omit(state, 'initialState'),
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
