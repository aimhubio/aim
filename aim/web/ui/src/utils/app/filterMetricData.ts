import { IRunBatch } from 'pages/RunDetail/types';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { SequenceFullView } from 'types/core/AimObjects';

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
  sequence: SequenceFullView,
  alignmentType: AlignmentOptionsEnum = AlignmentOptionsEnum.STEP,
  axesScaleType?: IAxesScaleState,
) {
  const values = float64FromUint8(sequence.values?.blob);
  const steps = float64FromUint8(sequence.iters?.blob);
  const epochs = float64FromUint8(sequence.epochs?.blob);
  const timestamps = float64FromUint8(sequence.timestamps?.blob);
  const x_axis_iters = float64FromUint8(sequence.x_axis_iters?.blob);
  const x_axis_values = float64FromUint8(sequence.x_axis_values?.blob);

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
    }).map((timestamp: number) => Math.round(timestamp * 1000)),
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
