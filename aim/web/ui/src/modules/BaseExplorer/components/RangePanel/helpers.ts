import _ from 'lodash-es';

/**
 * Returns the density and the slice of the range.
 *
 * @param {[number, number]} total The total of hte range.
 * @param {[number, number]} used The used slice of the range.
 * @return {{density: number, slice: [number, number]}} the density and the slice of the range.
 */
export function getRangeAndDensityData(
  total: [number, number],
  used: [number, number],
  prevDensity: number,
) {
  // calculating range slice min and max values
  const slice: [number, number] = [
    // checking if the min used value in exist in the total range.
    // if yes, setting the min used value as slice min value
    // if not, setting the min total value as slice min value
    _.inRange(used[0], total[0] - 1, total[1] + 1) ? used[0] : total[0],
    // checking if the max used value in exist in the total range.
    // if yes, setting the max used value as slice max value
    // if not, setting the max total value as slice max value
    _.inRange(used[1], total[0] - 1, total[1] + 1) ? used[1] : total[1],
  ];
  // calculating the items count in range
  const rangeTotalCount = total[1] - total[0] === 0 ? 1 : total[1] - total[0];
  // checking if the previous density is bigger then the items in the total range.
  // setting the density value to the items count otherwise setting the the previous density.
  const density: number =
    prevDensity > rangeTotalCount ? rangeTotalCount : prevDensity;

  return { density, slice };
}

export function getRecordState(rangesData: any, rangeState: any) {
  const updatedRangesState: {
    record?: { slice: [number, number]; density: number };
    index?: { slice: [number, number]; density: number };
  } = {};

  // checking is record data exist
  if (rangesData?.ranges?.record_range_total) {
    const { record_range_used, record_range_total } = rangesData?.ranges;

    // setting record range slice and density
    updatedRangesState.record = getRangeAndDensityData(
      record_range_total,
      record_range_used,
      rangeState.record?.density ?? 50,
    );
  }

  // checking is index data exist
  if (rangesData?.ranges?.index_range_total) {
    const { index_range_total, index_range_used } = rangesData?.ranges;

    // setting index range slice and density
    updatedRangesState.index = getRangeAndDensityData(
      index_range_total,
      index_range_used,
      rangeState.index?.density ?? 5,
    );
  }

  return updatedRangesState;
}
