function getClosestValue(
  array: number[],
  num: number,
): { value: number; index: number } {
  let minDiff = Infinity;
  let index = 0;
  for (let i = 0; i < array.length; i++) {
    let diff = Math.abs(num - array[i]);
    if (diff < minDiff) {
      minDiff = diff;
      index = i;
    }
  }
  return {
    value: array[index],
    index,
  };
}

export default getClosestValue;
