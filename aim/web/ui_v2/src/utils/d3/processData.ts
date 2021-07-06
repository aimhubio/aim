import _ from 'lodash';

import { IProcessData, IProcessDataProps } from 'types/utils/d3/processData';
import { removeOutliers } from './removeOutliers';
import { minMaxOfArray } from 'utils/minMaxOfArray';

function processData(props: IProcessDataProps): IProcessData {
  let xSteps: number[] = [];
  let ySteps: number[] = [];

  const processedData = props.data.map((line) => {
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

    const d3FormatData: [number, number][] = filteredXValues.map((v, i) => [
      v,
      filteredYValues[i],
    ]);

    return Object.assign({}, line, {
      data: d3FormatData,
    });
  });

  xSteps = _.uniq(xSteps);
  ySteps = _.uniq(ySteps);

  if (props.displayOutliers) {
    ySteps = removeOutliers(ySteps, 4);
  }

  const [yMin, yMax] = minMaxOfArray(ySteps);
  const [xMin, xMax] = minMaxOfArray(xSteps);
  return {
    min: {
      x: xMin,
      y: yMin,
    },
    max: {
      x: xMax,
      y: yMax,
    },
    processedData,
  };
}

export default processData;
