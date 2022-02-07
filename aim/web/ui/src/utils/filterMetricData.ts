import { IFilterMetricDataParams } from 'types/utils/filterMetricData';

import { ScaleEnum } from './d3';

const isInvalidValue = (
  v: number,
  scaleType: ScaleEnum = ScaleEnum.Linear,
): boolean => {
  return (
    (!v && v !== 0) ||
    !isFinite(v) ||
    isNaN(v) ||
    (scaleType === ScaleEnum.Log && v <= 0)
  );
};

const getFilteredValues = (args: {
  data: number[];
  invalidXIndices: number[];
  invalidYIndices: number[];
}): number[] => {
  const { data, invalidXIndices, invalidYIndices } = args;

  return data.filter(
    (v: number, i: number) =>
      invalidXIndices.indexOf(i) === -1 && invalidYIndices.indexOf(i) === -1,
  );
};

function filterMetricData({
  values = [],
  steps = [],
  epochs = [],
  timestamps = [],
  axesScaleType,
}: IFilterMetricDataParams) {
  const invalidXIndices: number[] = steps.reduce(
    (acc: number[], v: number, i: number) => {
      if (isInvalidValue(v, axesScaleType?.xAxis)) {
        acc = acc.concat([i]);
      }
      return acc;
    },
    [],
  );

  const invalidYIndices: number[] = values.reduce(
    (acc: number[], v: number, i: number) => {
      if (isInvalidValue(v, axesScaleType?.yAxis)) {
        acc = acc.concat([i]);
      }
      return acc;
    },
    [],
  );

  const filteredXValues: number[] = getFilteredValues({
    data: steps,
    invalidXIndices,
    invalidYIndices,
  });

  const filteredYValues: number[] = getFilteredValues({
    data: values,
    invalidXIndices,
    invalidYIndices,
  });

  const filteredEpochs: number[] = epochs.filter(
    (epoch) => !isInvalidValue(epoch),
  );

  const filteredTimestamps: number[] = timestamps.filter(
    (timestamp) => !isInvalidValue(timestamp),
  );

  return {
    values: filteredYValues,
    steps: filteredXValues,
    epochs: filteredEpochs,
    timestamps: filteredTimestamps,
  };
}

export default filterMetricData;
