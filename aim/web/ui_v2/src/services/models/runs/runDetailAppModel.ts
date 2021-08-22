import runsService from 'services/api/runs/runsService';
import { IRunBatch } from 'types/pages/runs/Runs';
import createModel from '../model';

const model = createModel<Partial<any>>({});

let getRunsInfoRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};
let getRunsBatchRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

function initialize() {
  model.init();
}

function getRunInfo(runHash: string) {
  if (getRunsInfoRequestRef) {
    getRunsInfoRequestRef.abort();
  }
  getRunsInfoRequestRef = runsService.getRunInfo(runHash);
  return {
    call: async () => {
      const data = await getRunsInfoRequestRef.call();
      model.setState({
        runParams: data.params,
        runTraces: data.traces,
        runInfo: data.props,
      });
    },
    abort: getRunsInfoRequestRef.abort,
  };
}

function getRunBatch(body: any, runHash: string) {
  if (getRunsBatchRequestRef) {
    getRunsBatchRequestRef.abort();
  }
  getRunsBatchRequestRef = runsService.getRunBatch(body, runHash);
  return {
    call: async () => {
      const data = await getRunsBatchRequestRef.call();
      const runMetricsBatch: IRunBatch[] = [];
      const runSystemBatch: IRunBatch[] = [];
      data.forEach((run: IRunBatch) => {
        if (run.metric_name.startsWith('__system__')) {
          runSystemBatch.push(run);
        } else {
          runMetricsBatch.push(run);
        }
      });
      model.setState({
        ...model.getState(),
        runMetricsBatch,
        runSystemBatch,
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
    .then(() => {
      model.setState({
        ...state,
        runInfo: {
          ...state?.runInfo,
          archived,
        },
      });
    });
}

const runDetailAppModel = {
  ...model,
  initialize,
  getRunInfo,
  getRunBatch,
  archiveRun,
};

export default runDetailAppModel;
