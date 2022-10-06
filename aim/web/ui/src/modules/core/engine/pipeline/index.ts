import { isEmpty, isEqual, omit } from 'lodash-es';

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

import { SequenceTypesEnum } from 'types/core/enums';

import { PipelineStatusEnum, ProgressState } from '../types';
import getUrlSearchParam from '../../utils/getUrlSearchParam';
import updateUrlSearchParam from '../../utils/updateUrlSearchParam';
import { encode } from '../../../../utils/encoder/encoder';
import { getRecordState } from '../../../BaseExplorer/components/RangePanel/helpers';
import browserHistory from '../../services/browserHistory';

import createState, {
  CurrentGrouping,
  getInitialState,
  IPipelineState,
  PipelineStateBridge,
} from './state';

export interface IPipelineEngine<TObject, TStore> {
  state: {
    pipeline: IPipelineState<TObject>;
  };
  engine: {
    search: (params: RunsSearchQueryParams, isInternal?: boolean) => void;
    group: (config: CurrentGrouping, isInternal?: boolean) => void;
    getSequenceName: () => SequenceTypesEnum;
    destroy: () => void;
    reset: () => void;
    initialize: () => void;
  } & Omit<PipelineStateBridge<TObject, TStore>, 'selectors'> &
    PipelineStateBridge<TObject, TStore>['selectors'];
}

function createPipelineEngine<TStore, TObject>(
  store: any,
  options: Omit<PipelineOptions, 'callbacks'>,
  defaultGroupings?: any,
): IPipelineEngine<TObject, TStore> {
  const initialState = getInitialState<TObject>();

  if (defaultGroupings) {
    initialState.currentGroupings = defaultGroupings;
  }

  const state = createState<TStore, TObject>(store, initialState);

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
   * @param isInternal - indicates does it need to update current query or not
   */
  function search(
    params: RunsSearchQueryParams,
    isInternal: boolean = false,
  ): void {
    const currentGroupings = state.getCurrentGroupings();

    state.setCurrentQuery(params);

    if (!isInternal) {
      const queryState = store.getState().query;

      if (!queryState.ranges.isInitial) {
        const url = updateUrlSearchParam(
          'query',
          encode({
            queryState: {
              ...queryState,
              ranges: {
                ...queryState.ranges,
                isApplyButtonDisabled: true,
              },
            },
            readyQuery: params,
          }),
        );

        console.log(
          'search going to update form',
          url !== `${window.location.pathname}${window.location.search}`,
        );
        if (url !== `${window.location.pathname}${window.location.search}`) {
          browserHistory.push(url, null);
        }
      }
    }

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
        state.setResult(data, foundGroups, additionalData, queryableData);
        state.changeCurrentPhaseOrStatus(
          isEmpty(data) ? PipelineStatusEnum.Empty : state.getStatus(),
        );

        if (!isInternal) {
          const url = updateUrlSearchParam(
            'query',
            encode({
              queryState: {
                ...store.getState().query,
                ranges: {
                  ...store.getState().query.ranges,
                  isApplyButtonDisabled: true,
                },
              },
              readyQuery: params,
            }),
          );

          console.log(
            'search going to update record',
            url !== `${window.location.pathname}${window.location.search}`,
          );
          if (url !== `${window.location.pathname}${window.location.search}`) {
            browserHistory.push(url, null);
          }
        }
      })
      .catch((ex: unknown) => {});
  }

  function normalizeGroupConfig(config: CurrentGrouping) {
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
    return groupConfig;
  }

  /**
   * Function group, used to execute pipeline started from group
   *      using cache for query and adapter phases, and run only grouping
   * @example
   *     pipeline.engine.group(config)
   * @param {CurrentGrouping} config
   * @param {boolean} isInternal - indicates called internally or from UI, if isInternal doesnt need to update current query
   */
  function group(config: CurrentGrouping, isInternal: boolean = false): void {
    state.setCurrentGroupings(config);
    console.log('group');

    const equal = isEqual(config, defaultGroupings);
    console.log(equal);
    if (!isInternal) {
      const url = updateUrlSearchParam(
        'groupings',
        equal ? null : encode(config),
      );
      console.log(
        'update group',
        url !== `${window.location.pathname}${window.location.search}`,
      );

      if (url !== `${window.location.pathname}${window.location.search}`) {
        browserHistory.push(url, null);
      }
    }

    pipeline
      .execute({
        query: {
          params: state.getCurrentQuery(),
        },
        group: normalizeGroupConfig(config),
      })
      .then((res) => {
        const { data, additionalData, foundGroups } = res;
        state.setResult(data, foundGroups, additionalData);
      });
  }

  function reset() {
    group(defaultGroupings);
  }

  function initialize() {
    const stateFromStorage = getUrlSearchParam('groupings') || {};

    // update state
    if (!isEmpty(stateFromStorage)) {
      state.setCurrentGroupings(stateFromStorage);
    }

    browserHistory.listenSearchParam<any>(
      'groupings',
      (groupings: any) => {
        if (!isEmpty(groupings)) {
          group(groupings, true);
        } else {
          group(defaultGroupings, true);
        }
      },
      ['PUSH'],
    );

    browserHistory.listenSearchParam<any>(
      'query',
      (query: any) => {
        console.log('query changed');
        if (!isEmpty(query)) {
          search(query.readyQuery, true);
        } else {
          search({ q: '' }, true);
        }
      },
      ['PUSH'],
    );
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
      reset,
      initialize,
      destroy: () => {
        pipeline.clearCache();
      },
    },
  };
}

export default createPipelineEngine;
