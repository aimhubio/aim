function getClosestValue(array: number[], num: number): number {
  let minDiff = Infinity;
  let value: number = array[0];
  for (let i = 0; i < array.length; i++) {
    let diff = Math.abs(num - array[i]);
    if (diff < minDiff) {
      minDiff = diff;
      value = array[i];
    }
  }
  return value;
}

export default getClosestValue;
