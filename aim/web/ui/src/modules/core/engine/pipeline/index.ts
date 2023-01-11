import _ from 'lodash-es';

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
import getUrlSearchParam from 'modules/core/utils/getUrlSearchParam';
import getUpdatedUrl from 'modules/core/utils/getUpdatedUrl';
import browserHistory from 'modules/core/services/browserHistory';
import getQueryParamsFromState from 'modules/core/utils/getQueryParamsFromState';

import { SequenceTypesEnum } from 'types/core/enums';

import { encode } from 'utils/encoder/encoder';

import { PipelineStatusEnum, ProgressState } from '../types';
import { QueryState } from '../explorer/query';
import { INotificationsEngine } from '../notifications';

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
    initialize: () => () => void;
  } & Omit<PipelineStateBridge<TObject, TStore>, 'selectors'> &
    PipelineStateBridge<TObject, TStore>['selectors'];
}

function createPipelineEngine<TStore, TObject>(
  store: any,
  options: Omit<PipelineOptions, 'callbacks'>,
  defaultGroupings?: any,
  notificationsEngine?: INotificationsEngine<TStore>['engine'],
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
    state.setError(null);

    if (!isInternal && pipelineOptions.persist) {
      const queryState = store.getState().query;

      if (!queryState.ranges.isInitial) {
        const url = getUpdatedUrl(
          'query',
          encode({
            ...queryState,
            ranges: {
              ...queryState.ranges,
              isApplyButtonDisabled: true,
            },
          }),
        );

        // TODO move check into custom push method
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
          _.isEmpty(data) ? PipelineStatusEnum.Empty : state.getStatus(),
        );

        if (!isInternal && pipelineOptions.persist) {
          const url = getUpdatedUrl(
            'query',
            encode({
              ...store.getState().query,
              ranges: {
                ...store.getState().query.ranges,
                isApplyButtonDisabled: true,
              },
            }),
          );
          if (url !== `${window.location.pathname}${window.location.search}`) {
            browserHistory.push(url, null);
          }
        }
      })
      .catch((err) => {
        state.setError(err);
        state.changeCurrentPhaseOrStatus(PipelineStatusEnum.Failed);
        if (err && err.message !== 'SyntaxError') {
          notificationsEngine?.error(err.message);
        }
      });
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

    const equal = _.isEqual(config, defaultGroupings);

    if (!isInternal && pipelineOptions.persist) {
      const url = getUpdatedUrl('groupings', equal ? null : encode(config));

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
    if (pipelineOptions.persist) {
      const stateFromStorage = getUrlSearchParam('groupings') || {};
      // update state
      if (!_.isEmpty(stateFromStorage)) {
        state.setCurrentGroupings(stateFromStorage);
      }

      const removeGroupingsListener = browserHistory.listenSearchParam<any>(
        'groupings',
        (groupings: any) => {
          if (!_.isEmpty(groupings)) {
            group(groupings, true);
          } else {
            group(defaultGroupings, true);
          }
        },
        ['PUSH'],
      );

      const removeQueryListener =
        browserHistory.listenSearchParam<QueryState | null>(
          'query',
          (query: QueryState | null) => {
            if (!_.isEmpty(query)) {
              search(
                {
                  ...getQueryParamsFromState(
                    query as QueryState,
                    options.sequenceName,
                  ),
                  report_progress: true,
                },
                true,
              );
            } else {
              search({ q: '()', report_progress: true }, true);
            }
          },
          ['PUSH'],
        );
      return () => {
        removeGroupingsListener();
        removeQueryListener();
        // pipeline.clearCache();
      };
    }

    return () => {
      // pipeline.clearCache();
    };
  }

  return {
    state: {
      pipeline: state.initialState,
    },
    engine: {
      ..._.omit(state, ['selectors']),
      ...state.selectors,
      getSequenceName: () => options.sequenceName,
      search,
      group,
      reset,
      initialize,
      destroy: () => {
        /**
         * This line creates some bugs right now, use this after creating complete clean-up mechanism for resources
         */
        // pipeline.clearCache();
      },
    },
  };
}

export default createPipelineEngine;
