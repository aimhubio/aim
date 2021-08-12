import _ from 'lodash-es';

export enum SmoothingAlgorithmEnum {
  EMA = 'EXPONENTIAL_MOVING_AVERAGE',
  CMA = 'CENTRED_MOVING_AVERAGE',
}

export function calculateExponentialMovingAverage(
  data: number[],
  smoothFactor: number,
): number[] {
  const smoothedData = [data[0]];
  for (let i = 1; i < data.length; i++) {
    smoothedData.push(
      smoothedData[i - 1] * smoothFactor + data[i] * (1 - smoothFactor),
    );
  }
  return smoothedData;
}

export function calculateCentralMovingAverage(
  data: number[],
  smoothFactor: number,
): number[] {
  const smoothedData = [];
  const len = data.length;
  const windowSize = (smoothFactor - 1) / 2;

  for (let i = 0; i < len; i++) {
    const start = i - windowSize;
    const end = i + windowSize + 1;
    const currentWindow = data.slice(
      start < 0 ? 0 : start,
      end > len + 1 ? len + 1 : end,
    );
    const windowAverage = _.sum(currentWindow) / currentWindow.length;
    smoothedData.push(windowAverage);
  }

  return smoothedData;
}
