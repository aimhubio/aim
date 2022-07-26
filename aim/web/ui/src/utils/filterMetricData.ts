import { IRunBatch } from 'pages/RunDetail/types';

import { IMetricTrace } from 'types/services/models/metrics/runModel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

import { AlignmentOptionsEnum, ScaleEnum } from 'utils/d3';
import { float64FromUint8 } from 'utils/helper';

function isInvalidMetricValue(
  v: number,
  scaleType: ScaleEnum = ScaleEnum.Linear,
): boolean {
  return (
    (!v && v !== 0) ||
    !isFinite(v) ||
    isNaN(v) ||
    (scaleType === ScaleEnum.Log && v < 0)
  );
}

function getFilteredMetricValues<T = number[]>(args: {
  data: T;
  invalidIndicesArray: number[][];
}): T {
  const { data, invalidIndicesArray } = args;
  // @ts-ignore
  return data.filter((v: number, i: number) =>
    invalidIndicesArray.every(
      (invalidIndices) => invalidIndices.indexOf(i) === -1,
    ),
  );
}

function getInvalidIndices<T = number[]>(
  values: T,
  scaleType?: ScaleEnum,
): number[] {
  // @ts-ignore
  return values.reduce((acc: number[], v: number, i: number) => {
    if (isInvalidMetricValue(v, scaleType)) {
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
  const values = float64FromUint8(trace.values.blob);
  const steps = float64FromUint8(trace.iters.blob);
  const epochs = float64FromUint8(trace.epochs.blob);
  const timestamps = float64FromUint8(trace.timestamps.blob);
  const x_axis_iters = float64FromUint8(
    trace.x_axis_iters?.blob || new Uint8Array(),
  );
  const x_axis_values = float64FromUint8(
    trace.x_axis_values?.blob || new Uint8Array(),
  );

  const { xAxis, yAxis } = axesScaleType || {};

  const invalidIndices = {
    values: getInvalidIndices(values, yAxis),
    steps: getInvalidIndices(steps, xAxis),
    epochs: getInvalidIndices(epochs, xAxis),
    timestamps: getInvalidIndices(timestamps, xAxis),
    x_axis_iters: getInvalidIndices(x_axis_iters, xAxis),
    x_axis_values: getInvalidIndices(x_axis_values, xAxis),
  };

  const invalidXIndicesObj = {
    [AlignmentOptionsEnum.STEP]: [invalidIndices.steps],
    [AlignmentOptionsEnum.EPOCH]: [invalidIndices.epochs],
    [AlignmentOptionsEnum.RELATIVE_TIME]: [invalidIndices.timestamps],
    [AlignmentOptionsEnum.ABSOLUTE_TIME]: [invalidIndices.timestamps],
    [AlignmentOptionsEnum.CUSTOM_METRIC]: [
      invalidIndices.x_axis_iters,
      invalidIndices.x_axis_values,
    ],
  };

  return {
    values: getFilteredMetricValues({
      data: values,
      invalidIndicesArray: [
        ...invalidXIndicesObj[alignmentType],
        invalidIndices.values,
      ],
    }),
    steps: getFilteredMetricValues({
      data: steps,
      invalidIndicesArray: [invalidIndices.steps, invalidIndices.values],
    }),
    epochs: getFilteredMetricValues({
      data: epochs,
      invalidIndicesArray: [invalidIndices.epochs, invalidIndices.values],
    }),
    timestamps: getFilteredMetricValues({
      data: timestamps,
      invalidIndicesArray: [invalidIndices.timestamps, invalidIndices.values],
    }),
    x_axis_values: getFilteredMetricValues({
      data: x_axis_values,
      invalidIndicesArray: [
        invalidIndices.x_axis_iters,
        invalidIndices.x_axis_values,
      ],
    }),
    x_axis_iters: getFilteredMetricValues({
      data: x_axis_iters,
      invalidIndicesArray: [
        invalidIndices.x_axis_iters,
        invalidIndices.x_axis_values,
      ],
    }),
  };
}

export function filterSingleRunMetricsData(run: IRunBatch) {
  if (!run?.values?.length || !run?.iters?.length) {
    return {
      values: [],
      iters: [],
    };
  }
  const { values, iters } = run;
  const invalidIndices = {
    values: getInvalidIndices(values),
    iters: getInvalidIndices(iters),
  };
  return {
    values: getFilteredMetricValues({
      data: values,
      invalidIndicesArray: [invalidIndices.iters, invalidIndices.values],
    }),
    iters: getFilteredMetricValues({
      data: iters,
      invalidIndicesArray: [invalidIndices.iters, invalidIndices.values],
    }),
  };
}
