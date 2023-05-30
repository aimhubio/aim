export function filterArrayByIndexes(
  missingIndexes: number[],
  array: number[] | Float64Array,
): Float64Array {
  return new Float64Array(
    array.filter((item, index) => missingIndexes.indexOf(index) === -1),
  );
}
