import _ from 'lodash';
import {
  IProcessData,
  IProcessDataProps,
} from '../../types/utils/d3/processData';

function processData(props: IProcessDataProps): IProcessData {
  const { data } = props;

  // data: ILine[]

  let xSteps: number[] = [];
  let ySteps: number[] = [];

  const processedData = data.map((line) => {
    const { xValues, yValues } = line.data;

    const invalidXIndices: number[] = [];
    const invalidYIndices: number[] = [];

    xValues.forEach((v, i) => {
      if (!isFinite(v) || isNaN(v) || v === null) {
        invalidXIndices.push(i);
      }
    });

    yValues.forEach((v, i) => {
      if (!isFinite(v) || isNaN(v) || v === null) {
        invalidYIndices.push(i);
      }
    });

    const filteredXValues = xValues.filter(
      (v, i) =>
        invalidXIndices.indexOf(i) === -1 && invalidYIndices.indexOf(i) === -1,
    );

    const filteredYValues = yValues.filter(
      (v, i) =>
        invalidXIndices.indexOf(i) === -1 && invalidYIndices.indexOf(i) === -1,
    );

    xSteps = xSteps.concat(filteredXValues);
    ySteps = ySteps.concat(filteredYValues);

    return Object.assign({}, line, {
      data: {
        xValues: filteredXValues,
        yValues: filteredYValues,
      },
    });
  });

  xSteps = _.uniq(xSteps);
  ySteps = _.uniq(ySteps);

  return {
    min: {
      x: Math.min(...xSteps),
      y: Math.min(...ySteps),
    },
    max: {
      x: Math.max(...xSteps),
      y: Math.max(...ySteps),
    },
    processedData,
  };
}

export default processData;
