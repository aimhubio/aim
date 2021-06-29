import _ from 'lodash';
import {
  IProcessData,
  IProcessDataProps,
} from '../../types/utils/d3/processData';

function processData(props: IProcessDataProps): IProcessData {
  const { data } = props;

  // TODO some data process
  // TODO filter data

  const axisValues: number[] = data.map((point) => point[0]);
  const traceValues: number[] = data.map((point) => point[1]);

  let xSteps: number[] = [];
  let yValues: number[] = [];

  xSteps = _.uniq(xSteps.concat(axisValues).sort((a, b) => a - b));
  yValues = _.uniq(yValues.concat(traceValues).sort((a, b) => a - b));

  return {
    xMin: xSteps[0],
    xMax: xSteps[xSteps.length - 1],
    yMin: yValues[0],
    yMax: yValues[yValues.length - 1],
    xSteps,
    yValues,
  };
}

export default processData;
