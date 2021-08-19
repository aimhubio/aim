import runsService from 'services/api/runs/runsService';
import createModel from '../model';
import {
  adjustable_reader,
  decodePathsVals,
  decode_buffer_pairs,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import { IRun } from 'types/services/models/metrics/runModel';

const model = createModel<Partial<any>>({});

function getConfig() {
  return {
    // grouping: {
    //   color: ['run.params.hparams.seed'],
    //   style: ['run.params.hparams.max_k'],
    //   chart: [],
    //   // TODO refactor boolean value types objects into one
    //   reverseMode: {
    //     color: false,
    //     style: false,
    //     chart: false,
    //   },
    //   isApplied: {
    //     color: true,
    //     style: true,
    //     chart: true,
    //   },
    //   persistence: {
    //     color: false,
    //     style: false,
    //   },
    //   seed: {
    //     color: 10,
    //     style: 10,
    //   },
    //   paletteIndex: 0,
    //   selectOptions: [],
    // },
    // chart: {
    //   curveInterpolation: CurveEnum.Linear,
    //   isVisibleColorIndicator: false,
    //   focusedState: {
    //     key: null,
    //     xValue: null,
    //     yValue: null,
    //     active: false,
    //     chartIndex: null,
    //   },
    // },
    // select: {
    //   params: [
    //     { key: 'hparams.align', type: 'params' },
    //     { key: 'dataset.preproc', type: 'params' },
    //     { key: 'loss_scale', type: 'metric' },
    //     { key: 'nll_loss', type: 'metric' },
    //   ],
    //   query: '',
    // },
  };
}

function initialize() {
  model.init();
  //   model.setState({
  //     config: getConfig(),
  //   });
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

      const runsData: IRun[] = [];
      for await (let [keys, val] of objects) {
        const runData: any = val;
        runsData.push({ ...runData, runHash: keys[0] } as any);
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
