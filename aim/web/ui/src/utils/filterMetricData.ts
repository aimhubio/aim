import { IRunBatch } from 'pages/RunDetail/types';

import { IMetricTrace } from 'types/services/models/metrics/runModel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

import { AlignmentOptionsEnum, ScaleEnum } from 'utils/d3';

function isInvalidValue(
  v: number,
  scaleType: ScaleEnum = ScaleEnum.Linear,
): boolean {
  return (
    (!v && v !== 0) ||
    !isFinite(v) ||
    isNaN(v) ||
    (scaleType === ScaleEnum.Log && v <= 0)
  );
}

function getFilteredValues(args: {
  data: Float64Array;
  invalidIndicesArray: number[][];
}): Float64Array {
  const { data, invalidIndicesArray } = args;
  return data.filter((v: number, i: number) =>
    invalidIndicesArray.every(
      (invalidIndices) => invalidIndices.indexOf(i) === -1,
    ),
  );
}

function getInvalidIndices(
  values: Float64Array,
  scaleType?: ScaleEnum,
): number[] {
  return values.reduce((acc: number[], v: number, i: number) => {
    if (isInvalidValue(v, scaleType)) {
      acc = acc.concat([i]);
    }
    return acc;
  }, []);
}

export function filterMetricsData(
  trace: IMetricTrace,
  alignmentType: AlignmentOptionsEnum,
  axesScaleType?: IAxesScaleState,
) {
  const values = new Float64Array(trace.values.blob);
  const steps = new Float64Array(trace.iters.blob);
  const epochs = new Float64Array(trace.epochs.blob);
  const timestamps = new Float64Array(trace.timestamps.blob);
  const x_axis_iters = new Float64Array(trace.x_axis_iters?.blob || []);
  const x_axis_values = new Float64Array(trace.x_axis_values?.blob || []);

  const { xAxis, yAxis } = axesScaleType || {};

  const invalidIndices = {
    values: getInvalidIndices(values, yAxis),
    steps: getInvalidIndices(steps, xAxis),
    epochs: getInvalidIndices(epochs, xAxis),
    timestamps: getInvalidIndices(timestamps, xAxis),
    x_axis_iters: getInvalidIndices(x_axis_iters, xAxis),
    x_axis_values: getInvalidIndices(x_axis_values, xAxis),
  };

  let invalidXIndicesArray = [];

  switch (alignmentType) {
    case AlignmentOptionsEnum.STEP:
      invalidXIndicesArray = [invalidIndices.steps];
      break;
    case AlignmentOptionsEnum.EPOCH:
      invalidXIndicesArray = [invalidIndices.epochs];
      break;
    case AlignmentOptionsEnum.RELATIVE_TIME:
      invalidXIndicesArray = [invalidIndices.timestamps];
      break;
    case AlignmentOptionsEnum.ABSOLUTE_TIME:
      invalidXIndicesArray = [invalidIndices.timestamps];
      break;
    case AlignmentOptionsEnum.CUSTOM_METRIC:
      invalidXIndicesArray = [
        invalidIndices.x_axis_iters,
        invalidIndices.x_axis_values,
      ];
      break;
  }

  return {
    values: getFilteredValues({
      data: values,
      invalidIndicesArray: [...invalidXIndicesArray, invalidIndices.values],
    }),
    steps: getFilteredValues({
      data: steps,
      invalidIndicesArray: [invalidIndices.steps, invalidIndices.values],
    }),
    epochs: getFilteredValues({
      data: epochs,
      invalidIndicesArray: [invalidIndices.epochs, invalidIndices.values],
    }),
    timestamps: getFilteredValues({
      data: timestamps,
      invalidIndicesArray: [invalidIndices.timestamps, invalidIndices.values],
    }),
    x_axis_values: getFilteredValues({
      data: x_axis_values,
      invalidIndicesArray: [
        invalidIndices.x_axis_iters,
        invalidIndices.x_axis_values,
      ],
    }),
    x_axis_iters: getFilteredValues({
      data: x_axis_iters,
      invalidIndicesArray: [
        invalidIndices.x_axis_iters,
        invalidIndices.x_axis_values,
      ],
    }),
  };
}

export function filterSingleRunMetricsData(run: IRunBatch) {
  const { values = new Float64Array(), iters = new Float64Array() } = run || {};
  const invalidIndices = {
    values: getInvalidIndices(values),
    iters: getInvalidIndices(iters),
  };
  return {
    values: getFilteredValues({
      data: values,
      invalidIndicesArray: [invalidIndices.iters, invalidIndices.values],
    }),
    iters: getFilteredValues({
      data: iters,
      invalidIndicesArray: [invalidIndices.iters, invalidIndices.values],
    }),
  };
}
