import _ from 'lodash';

import {
  IProcessData,
  IProcessDataProps,
  IGetFilteredValuesParams,
} from 'types/utils/d3/processData';
import { minMaxOfArray } from 'utils/minMaxOfArray';
import { ScaleEnum } from '.';
import { removeOutliers } from '../removeOutliers';

const isInvalidValue = (v: number, scaleType: ScaleEnum): boolean =>
  !isFinite(v) ||
  isNaN(v) ||
  v === null ||
  (scaleType === ScaleEnum.Log && v <= 0);

function getFilteredValues(params: IGetFilteredValuesParams): number[] {
  const { data, invalidXIndices, invalidYIndices } = params;

  return data.filter(
    (v: number, i: number) =>
      invalidXIndices.indexOf(i) === -1 && invalidYIndices.indexOf(i) === -1,
  );
}

function processData(params: IProcessDataProps): IProcessData {
  const { data, displayOutliers, axesScaleType } = params;

  let xValues: number[] = [];
  let yValues: number[] = [];

  const processedData = data.map((line) => {
    const invalidXIndices: number[] = line.data.xValues.reduce(
      (acc: number[], v: number, i: number) => {
        if (isInvalidValue(v, axesScaleType.xAxis)) {
          acc = acc.concat([i]);
        }
        return acc;
      },
      [],
    );
    const invalidYIndices: number[] = line.data.yValues.reduce(
      (acc: number[], v: number, i: number) => {
        if (isInvalidValue(v, axesScaleType.yAxis)) {
          acc = acc.concat([i]);
        }
        return acc;
      },
      [],
    );

    const filteredXValues: number[] = getFilteredValues({
      data: line.data.xValues,
      invalidXIndices,
      invalidYIndices,
    });

    const filteredYValues: number[] = getFilteredValues({
      data: line.data.yValues,
      invalidXIndices,
      invalidYIndices,
    });

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
