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
import {
  decodeBufferPairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import { filterSingleRunMetricsData } from 'utils/filterMetricData';

import createModel from '../model';

const model = createModel<Partial<any>>({
  isRunInfoLoading: true,
  isExperimentsLoading: false,
  isRunBatchLoading: false,
  isRunsOfExperimentLoading: false,
  isRunLogsLoading: false,
  isLoadMoreButtonShown: true,
});

let getRunsInfoRequestRef: IApiRequest<void>;
let getRunsBatchRequestRef: IApiRequest<void>;
let getExperimentsDataRequestRef: IApiRequest<void>;
let getRunsOfExperimentRequestRef: IApiRequest<void>;
let getRunsLogsRequestRef: IApiRequest<void>;

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

function getRunInfo(runHash: string): IApiRequest<void> {
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

function getRunLogs({
  runHash,
  record_range,
  isLiveUpdate = false,
  isLoadMore = false,
}: {
  runHash: string;
  record_range?: string;
  isLiveUpdate?: boolean;
  isLoadMore?: boolean;
}) {
  if (getRunsLogsRequestRef) {
    getRunsLogsRequestRef.abort();
  }
  getRunsLogsRequestRef = runsService.getRunLogs(runHash, record_range);
  return {
    call: async () => {
      const runLogs = model.getState()?.runLogs ?? {};
      if (!isLiveUpdate) {
        model.setState({ isRunLogsLoading: true });
      }

      const stream = await getRunsLogsRequestRef.call((detail: any) => {
        exceptionHandler({ detail, model });
      });
      let bufferPairs = decodeBufferPairs(stream);
      let decodedPairs = decodePathsVals(bufferPairs);
      let objects = iterFoldTree(decodedPairs, 1);
      const runLogsData: { [key: string]: any } = {};
      for await (let [keys, val] of objects) {
        runLogsData[keys[0]] = { index: +keys[0], value: val };
      }
      const updatedLogsData: { [key: string]: any } = {
        ...runLogs,
        ...runLogsData,
      };

      model.setState({
        runLogs: updatedLogsData,
        updatedLogsCount:
          isLiveUpdate || isLoadMore
            ? _.keys(updatedLogsData).length - _.keys(runLogs).length
            : 0,
        isRunLogsLoading: false,
      });
    },
    abort: getRunsLogsRequestRef.abort,
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

function editRunNameAndDescription(
  id: string,
  name: string,
  description: string,
  archived: boolean,
) {
  try {
    runsService
      .editRunNameAndDescription(id, name, description, archived)
      .call((detail) => {
        exceptionHandler({ model, detail });
      })
      .then((res: any) => {
        const state = model.getState();

        model.setState({
          ...state,
          runInfo: {
            ...state?.runInfo,
            name,
            description,
          },
        });
        if (res.id) {
          onNotificationAdd({
            id: Date.now(),
            severity: 'success',
            messages: ['Changes were saved'],
          });
        } else {
          onNotificationAdd({
            id: Date.now(),
            severity: 'error',
            messages: ['Something went wrong'],
          });
        }
        analytics.trackEvent('[RunDetail] Edit Run name and description');
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
  getRunLogs,
  getRunMetricsBatch,
  getExperimentsData,
  getRunsOfExperiment,
  archiveRun,
  deleteRun,
  onNotificationAdd,
  onNotificationDelete,
  editRunNameAndDescription,
};

export default runDetailAppModel;
