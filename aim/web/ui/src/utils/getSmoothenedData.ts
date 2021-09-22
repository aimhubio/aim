import {
  calculateCentralMovingAverage,
  calculateExponentialMovingAverage,
  SmoothingAlgorithmEnum,
} from './smoothingData';

export default function getSmoothenedData({
  smoothingAlgorithm,
  smoothingFactor,
  data,
}: {
  smoothingAlgorithm: SmoothingAlgorithmEnum;
  smoothingFactor: number;
  data: number[];
}): number[] {
  return smoothingAlgorithm === SmoothingAlgorithmEnum.EMA
    ? (calculateExponentialMovingAverage(
        data as number[],
        smoothingFactor,
      ) as any)
    : calculateCentralMovingAverage(data as number[], smoothingFactor);
}
