export function minMaxOfArray(arr: number[]): number[] {
  let max: number = arr[0];
  let min: number = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
    if (min > arr[i]) {
      min = arr[i];
    }
  }
  return [min, max];
}
