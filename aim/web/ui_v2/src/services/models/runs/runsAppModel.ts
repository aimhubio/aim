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
import { getRunsTableColumns } from 'pages/Runs/components/RunsTableColumns/RunsTableColumns';
import {
  IParam,
  IParamsAppConfig,
} from 'types/services/models/params/paramsAppModel';
import getObjectPaths from 'utils/getObjectPaths';
import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import _ from 'lodash-es';
import { encode } from 'utils/encoder/encoder';

const model = createModel<Partial<any>>({
  requestIsPending: true,
});

function initialize() {
  model.init();
}

function processData(data: any[]): {
  data: any[];
  params: string[];
} {
  const grouping = model.getState()?.config?.grouping;
  let runs: IParam[] = [];
  let params: string[] = [];
  const paletteIndex: number = grouping?.paletteIndex || 0;
  data.forEach((run: IRun<IParamTrace>, index) => {
    params = params.concat(getObjectPaths(run.params, run.params));

    runs.push({
      run,
      color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
      key: run.hash,
      dasharray: DASH_ARRAYS[0],
    });
  });
  const processedData = runs; // grouping(runs)
  const uniqParams = _.uniq(params);

  return {
    data: processedData,
    params: uniqParams,
  };
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
      const { data, params } = processData(runsData);

      model.setState({
        data: runsData,
        requestIsPending: false,
        tableColumns: getRunsTableColumns(params, data[0]?.config),
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
