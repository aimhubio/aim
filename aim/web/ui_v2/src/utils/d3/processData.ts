import _ from 'lodash';

import {
  IProcessData,
  IProcessDataProps,
} from '../../types/utils/d3/processData';

const isInvalidValue = (v: number): boolean =>
  !isFinite(v) || isNaN(v) || v === null;

function processData(props: IProcessDataProps): IProcessData {
  const { data } = props;

  let xValues: number[] = [];
  let yValues: number[] = [];

  const processedData = data.map((line) => {
    const invalidXIndices = line.data.xValues.reduce(
      (acc: number[], v: number, i: number) => {
        if (isInvalidValue(v)) {
          acc = acc.concat([i]);
        }
        return acc;
      },
      [],
    );
    const invalidYIndices = line.data.yValues.reduce(
      (acc: number[], v: number, i: number) => {
        if (isInvalidValue(v)) {
          acc = acc.concat([i]);
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

  return {
    min: {
      x: Math.min(...xValues),
      y: Math.min(...yValues),
    },
    max: {
      x: Math.max(...xValues),
      y: Math.max(...yValues),
    },
    processedData,
  };
}

export default processData;
