import _ from 'lodash';

import { IProcessData, IProcessDataProps } from 'types/utils/d3/processData';
import getFilteredValues from 'utils/getFilteredValues';
import { minMaxOfArray } from 'utils/minMaxOfArray';
import { removeOutliers } from '../removeOutliers';

const isInvalidValue = (v: number): boolean =>
  !isFinite(v) || isNaN(v) || v === null;

function processData(params: IProcessDataProps): IProcessData {
  const { data, displayOutliers, axesScaleType } = params;

  let xValues: number[] = [];
  let yValues: number[] = [];

  const processedData = data.map((line) => {
    const invalidXIndices: number[] = line.data.xValues.reduce(
      (acc: number[], v: number, i: number) => {
        if (isInvalidValue(v)) {
          acc = acc.concat([i]);
        }
        return acc;
      },
      [],
    );
    const invalidYIndices: number[] = line.data.yValues.reduce(
      (acc: number[], v: number, i: number) => {
        if (isInvalidValue(v)) {
          acc = acc.concat([i]);
        }
        return acc;
      },
      [],
    );

    const filteredXValues: number[] = getFilteredValues(
      line.data.xValues,
      invalidXIndices,
      invalidYIndices,
      axesScaleType.xAxis,
    );

    const filteredYValues: number[] = getFilteredValues(
      line.data.yValues,
      invalidXIndices,
      invalidYIndices,
      axesScaleType.yAxis,
    );

    xValues = xValues.concat(filteredXValues);
    yValues = yValues.concat(filteredYValues);

    return Object.assign(
      {
        color: '#000',
        dasharray: '0',
      },
      line,
      {
        data: {
          xValues: filteredXValues,
          yValues: filteredYValues,
        },
      },
    );
  });

  xValues = _.uniq(xValues);
  yValues = _.uniq(yValues);

  if (!displayOutliers) {
    yValues = removeOutliers(yValues, 4);
  }

  const [yMin, yMax] = minMaxOfArray(yValues);
  const [xMin, xMax] = minMaxOfArray(xValues);
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
