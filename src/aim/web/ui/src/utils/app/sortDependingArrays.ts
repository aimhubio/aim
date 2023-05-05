/**
 * Sort X-axis values in ascending order
 * Sort rest arrays values based on corresponding X-axis value order
 *
 * @property {number[]} xValues - X-axis values
 * @property {{key: number[]}} restArrays - object of arrays
 * */
function sortDependingArrays(
  xValues: number[],
  restArrays: { [key: string]: number[] } = {},
): {
  sortedXValues: number[];
  sortedArrays: { [key: string]: number[] };
} {
  const sortedXValues: number[] = [];
  const sortedArrays: { [key: string]: number[] } = {};
  const restArraysKeys = Object.keys(restArrays);
  for (let arrKey of restArraysKeys) {
    sortedArrays[arrKey] = [];
  }

  xValues
    .map((value, i) => ({ i, value }))
    .sort((a, b) => a.value - b.value)
    .forEach((xObj, i) => {
      sortedXValues[i] = xValues[xObj.i];
      for (let arrKey of restArraysKeys) {
        sortedArrays[arrKey][i] = restArrays[arrKey][xObj.i];
      }
    });
  return { sortedXValues, sortedArrays };
}

export default sortDependingArrays;
