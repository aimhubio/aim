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
