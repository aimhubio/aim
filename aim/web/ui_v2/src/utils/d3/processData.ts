import _ from 'lodash';

import { IProcessData, IProcessDataProps } from 'types/utils/d3/processData';
import { removeOutliers } from './removeOutliers';
import { minMaxOfArray } from 'utils/minMaxOfArray';

const isInvalidValue = (v: number): boolean =>
  !isFinite(v) || isNaN(v) || v === null;

const toTupleData = (x: number[], y: number[]): [number, number][] => {
  return x.map((v: number, i: number) => [v, y[i]]);
};

function processData(props: IProcessDataProps): IProcessData {
  const { data } = props;

  let xValues: number[] = [];
  let yValues: number[] = [];

  const processedData = data.map((line) => {
    const invalidXIndices = line.data.xValues.reduce(
      (acc: number[], v: number, i: number) => {
        if (isInvalidValue(v)) {
          acc.concat([i]);
        }
        return acc;
      },
      [],
    );
    const invalidYIndices = line.data.yValues.reduce(
      (acc: number[], v: number, i: number) => {
        if (isInvalidValue(v)) {
          acc.concat([i]);
        }
        return acc;
      },
      [],
    );

    const filteredXValues = line.data.xValues.filter(
      (v, i) =>
        invalidXIndices.indexOf(i) === -1 && invalidYIndices.indexOf(i) === -1,
    );
    const filteredYValues = line.data.yValues.filter(
      (v, i) =>
        invalidXIndices.indexOf(i) === -1 && invalidYIndices.indexOf(i) === -1,
    );

    xValues = xValues.concat(filteredXValues);
    yValues = yValues.concat(filteredYValues);

    return Object.assign({}, line, {
      data: toTupleData(filteredXValues, filteredYValues),
    });
  });

  xValues = _.uniq(xValues);
  yValues = _.uniq(yValues);

  if (!props.displayOutliers) {
    yValues = removeOutliers(yValues, 4);
  }

  const [xMin, xMax] = minMaxOfArray(xValues);
  const [yMin, yMax] = minMaxOfArray(yValues);
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
    xValues,
    yValues,
  };
}

export default processData;
