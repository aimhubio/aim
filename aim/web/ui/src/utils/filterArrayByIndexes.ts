export function filterArrayByIndexes(
  missingIndexes: number[],
  array: number[],
) {
  return array.filter((item, index) => missingIndexes.indexOf(index) === -1);
}
