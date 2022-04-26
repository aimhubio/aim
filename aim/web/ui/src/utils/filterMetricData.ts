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

function getInvalidIndices(values: number[], scaleType?: ScaleEnum) {
  return values.reduce((acc: number[], v: number, i: number) => {
    if (isInvalidValue(v, scaleType)) {
      acc = acc.concat([i]);
    }
    return acc;
  }, []);
}

function filterMetricData({
  values = [],
  steps = [],
  epochs = [],
  timestamps = [],
  axesScaleType,
}: IFilterMetricDataParams) {
  const invalidStepsIndices: number[] = getInvalidIndices(
    steps,
    axesScaleType?.xAxis,
  );

  const invalidValuesIndices: number[] = getInvalidIndices(
    values,
    axesScaleType?.yAxis,
  );

  const invalidEpochIndices: number[] = getInvalidIndices(
    epochs,
    axesScaleType?.xAxis,
  );

  const invalidTimeStampsIndices: number[] = getInvalidIndices(
    timestamps,
    axesScaleType?.xAxis,
  );

  const filteredSteps: number[] = getFilteredValues({
    data: steps,
    invalidXIndices: invalidStepsIndices,
    invalidYIndices: invalidValuesIndices,
  });

  const filteredValues: number[] = getFilteredValues({
    data: values,
    invalidXIndices: invalidStepsIndices,
    invalidYIndices: invalidValuesIndices,
  });

  const filteredEpochs: number[] = getFilteredValues({
    data: epochs,
    invalidXIndices: invalidEpochIndices,
    invalidYIndices: invalidValuesIndices,
  });

  const filteredTimestamps: number[] = getFilteredValues({
    data: timestamps,
    invalidXIndices: invalidTimeStampsIndices,
    invalidYIndices: invalidValuesIndices,
  });

  return {
    values: filteredValues,
    steps: filteredSteps,
    epochs: filteredEpochs,
    timestamps: filteredTimestamps,
  };
}

export default filterMetricData;
