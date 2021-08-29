import runsService from 'services/api/runs/runsService';
import createModel from '../model';
import {
  adjustable_reader,
  decodePathsVals,
  decode_buffer_pairs,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';

const model = createModel<Partial<any>>({});

function initialize() {
  model.init();
}

function getRunsData() {
  const { call, abort } = runsService.getRunsData();
  return {
    call: async () => {
      const stream = await call();
      let gen = adjustable_reader(stream);
      let buffer_pairs = decode_buffer_pairs(gen);
      let decodedPairs = decodePathsVals(buffer_pairs);
      let objects = iterFoldTree(decodedPairs, 1);

      const runsData: IRun<IMetricTrace | IParamTrace>[] = [];
      for await (let [keys, val] of objects) {
        const runData: any = val;
        runsData.push({ ...runData, hash: keys[0] } as any);
      }

      model.setState({
        data: runsData,
      });
    },
    abort,
  };
}

const runAppModel = {
  ...model,
  initialize,
  getRunsData,
};

export default runAppModel;
