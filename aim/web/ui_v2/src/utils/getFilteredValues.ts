import { ScaleEnum } from './d3';

function getFilteredValues(
  data: number[],
  invalidXIndices: number[],
  invalidYIndices: number[],
  scaleType: ScaleEnum,
): number[] {
  return data.filter((v: number, i: number) =>
    invalidXIndices.indexOf(i) === -1 &&
    invalidYIndices.indexOf(i) === -1 &&
    scaleType === ScaleEnum.Log
      ? v > 0
      : true,
  );
}

export default getFilteredValues;
