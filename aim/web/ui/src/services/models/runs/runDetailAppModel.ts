import _ from 'lodash-es';

import { IRunBatch } from 'pages/RunDetail/types';

import runsService from 'services/api/runs/runsService';
import * as analytics from 'services/analytics';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { IApiRequest } from 'types/services/services';

import exceptionHandler from 'utils/app/exceptionHandler';
import { encode } from 'utils/encoder/encoder';
import contextToString from 'utils/contextToString';
import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import { filterSingleRunMetricsData } from 'utils/filterMetricData';

import createModel from '../model';

const model = createModel<Partial<any>>({
  isRunInfoLoading: true,
  isExperimentsLoading: false,
  isRunBatchLoading: false,
  isRunsOfExperimentLoading: false,
  isLoadMoreButtonShown: true,
});

let getRunsInfoRequestRef: IApiRequest<void>;
let getRunsBatchRequestRef: IApiRequest<void>;
let getExperimentsDataRequestRef: IApiRequest<void>;
let getRunsOfExperimentRequestRef: IApiRequest<void>;

function initialize() {
  model.init();
}

function getExperimentsData() {
  if (getExperimentsDataRequestRef) {
    getExperimentsDataRequestRef.abort();
  }
  getExperimentsDataRequestRef = runsService.getExperimentsData();
  return {
    call: async () => {
      model.setState({ isExperimentsLoading: true });
      const data = await getExperimentsDataRequestRef.call((detail: any) => {
        exceptionHandler({ detail, model });
      });
      model.setState({
        isExperimentsLoading: false,
        experimentsData: _.orderBy(data, ['name'], ['asc']),
      });
      return data;
    },
    abort: getExperimentsDataRequestRef.abort,
  };
}

function getRunInfo(runHash: string) {
  if (getRunsInfoRequestRef) {
    getRunsInfoRequestRef.abort();
  }
  getRunsInfoRequestRef = runsService.getRunInfo(runHash);
  return {
    call: async () => {
      model.setState({ isRunInfoLoading: true });
      const data = await getRunsInfoRequestRef.call((detail: any) => {
        exceptionHandler({ detail, model });
      });
      model.setState({
        runParams: data.params,
        runTraces: data.traces,
        runInfo: data.props,
        experimentId: data.props.experiment.id,
        isRunInfoLoading: false,
      });
      return data;
    },
    abort: getRunsInfoRequestRef.abort,
  };
}

function getRunsOfExperiment(
  runHash: string,
  params?: { limit: number; offset?: string },
  isLoadingMore?: boolean,
) {
  if (getRunsOfExperimentRequestRef) {
    getRunsOfExperimentRequestRef.abort();
  }
  getRunsOfExperimentRequestRef = runsService.getRunsOfExperiment(
    runHash,
    params,
  );
  return {
    call: async () => {
      model.setState({ isRunsOfExperimentLoading: true });
      const data = await getRunsOfExperimentRequestRef.call((detail: any) => {
        exceptionHandler({ detail, model });
      });
      const runsOfExperiment = isLoadingMore
        ? [...(model.getState().runsOfExperiment || []), ...data.runs]
        : [...data.runs];
      model.setState({
        runsOfExperiment,
        isRunsOfExperimentLoading: false,
        experimentId: data.id,
        isLoadMoreButtonShown: data.runs.length === 10,
      });
    },
    abort: getRunsOfExperimentRequestRef.abort,
  };
}

function processRunBatchData(data: IRunBatch[]): {
  runMetricsBatch: IRunBatch[];
  runSystemBatch: IRunBatch[];
} {
  const runMetricsBatch: IRunBatch[] = [];
  const runSystemBatch: IRunBatch[] = [];

  for (let run of data) {
    const { values, iters } = filterSingleRunMetricsData(run);
    const metric = {
      ...run,
      values,
      iters,
      key: encode({
        name: run.name,
        context: run.context,
      }),
      sortKey: `${run.name}_${contextToString(run.context)}`,
    };
    if (run.name.startsWith('__system__')) {
      runSystemBatch.push(metric);
    } else {
      runMetricsBatch.push(metric);
    }
  }

  // sort run batch data
  runMetricsBatch.sort(alphabeticalSortComparator({ orderBy: 'sortKey' }));
  runSystemBatch.sort(alphabeticalSortComparator({ orderBy: 'sortKey' }));

  return { runMetricsBatch, runSystemBatch };
}

function getRunMetricsBatch(body: any, runHash: string) {
  if (getRunsBatchRequestRef) {
    getRunsBatchRequestRef.abort();
  }
  getRunsBatchRequestRef = runsService.getRunMetricsBatch(body, runHash);
  return {
    call: async () => {
      model.setState({ isRunBatchLoading: true });

      const data = await getRunsBatchRequestRef.call((detail: any) => {
        exceptionHandler({ detail, model });
      });
      const { runMetricsBatch, runSystemBatch } = processRunBatchData(data);

      model.setState({
        ...model.getState(),
        runMetricsBatch,
        runSystemBatch,
        isRunBatchLoading: false,
      });
    },
    abort: getRunsBatchRequestRef.abort,
  };
}

function archiveRun(id: string, archived: boolean = false) {
  const state = model.getState();
  runsService
    .archiveRun(id, archived)
    .call((detail) => {
      exceptionHandler({ detail, model });
    })
    .then((res: any) => {
      model.setState({
        ...state,
        runInfo: {
          ...state?.runInfo,
          archived,
        },
      });
      if (res.id) {
        onNotificationAdd({
          id: Date.now(),
          severity: 'success',
          messages: [
            archived
              ? 'Run successfully archived'
              : 'Run successfully unarchived',
          ],
        });
      } else {
        onNotificationAdd({
          id: Date.now(),
          severity: 'error',
          messages: ['Something went wrong'],
        });
      }
      analytics.trackEvent(
        archived ? '[RunDetail] Archive Run' : '[RunDetail] Unarchive Run',
      );
    });
}

function deleteRun(id: string, successCallback: () => void = _.noop) {
  try {
    runsService
      .deleteRun(id)
      .call((detail) => {
        exceptionHandler({ model, detail });
      })
      .then((res: any) => {
        if (res.id) {
          successCallback();
        } else {
          onNotificationAdd({
            id: Date.now(),
            severity: 'error',
            messages: ['Something went wrong'],
          });
        }
      });
  } catch (err: any) {
    onNotificationAdd({
      id: Date.now(),
      severity: 'error',
      messages: [err.message],
    });
  }
}

function onNotificationDelete(id: number) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData].filter((i) => i.id !== id);
  model.setState({ notifyData });
}

function onNotificationAdd(notification: INotification) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData, notification];
  model.setState({ notifyData });
  setTimeout(() => {
    onNotificationDelete(notification.id);
  }, 3000);
}

const runDetailAppModel = {
  ...model,
  initialize,
  getRunInfo,
  getRunMetricsBatch,
  getExperimentsData,
  getRunsOfExperiment,
  archiveRun,
  deleteRun,
  onNotificationAdd,
  onNotificationDelete,
};

export default runDetailAppModel;
