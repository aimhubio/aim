import { noop } from 'lodash';

import { IRunBatch } from 'pages/RunDetail/types';

import runsService from 'services/api/runs/runsService';
import * as analytics from 'services/analytics';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import createModel from '../model';

const model = createModel<Partial<any>>({
  isRunInfoLoading: true,
  isExperimentsLoading: false,
  isRunBatchLoading: false,
  isRunsOfExperimentLoading: false,
  isLoadMoreButtonShown: true,
});

let getRunsInfoRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};
let getRunsBatchRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};
let getExperimentsDataRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

let getRunsOfExperimentRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

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
      const data = await getExperimentsDataRequestRef.call();
      model.setState({
        isExperimentsLoading: false,
        experimentsData: data,
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
      const data = await getRunsInfoRequestRef.call();
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
      const data = await getRunsOfExperimentRequestRef.call();
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

function getRunMetricsBatch(body: any, runHash: string) {
  if (getRunsBatchRequestRef) {
    getRunsBatchRequestRef.abort();
  }
  getRunsBatchRequestRef = runsService.getRunMetricsBatch(body, runHash);
  return {
    call: async () => {
      model.setState({ isRunBatchLoading: true });

      const data = await getRunsBatchRequestRef.call();
      const runMetricsBatch: IRunBatch[] = [];
      const runSystemBatch: IRunBatch[] = [];
      data.forEach((run: IRunBatch) => {
        if (run.name.startsWith('__system__')) {
          runSystemBatch.push(run);
        } else {
          runMetricsBatch.push(run);
        }
      });
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
    .call()
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
          message: archived
            ? 'Run successfully archived'
            : 'Run successfully unarchived',
        });
      } else {
        onNotificationAdd({
          id: Date.now(),
          severity: 'error',
          message: 'Something went wrong',
        });
      }
      analytics.trackEvent(
        archived ? '[RunDetail] Archive Run' : '[RunDetail] Unarchive Run',
      );
    });
}

function deleteRun(id: string, successCallback: () => void = noop) {
  runsService
    .deleteRun(id)
    .call()
    .then((res: any) => {
      if (res.id) {
        successCallback();
      } else {
        onNotificationAdd({
          id: Date.now(),
          severity: 'error',
          message: 'Something went wrong',
        });
      }
      analytics.trackEvent('[RunDetail] Delete Run');
    });
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
