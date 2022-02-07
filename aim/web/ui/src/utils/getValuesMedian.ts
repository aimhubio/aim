export function getValuesMedian(values: number[] | Float64Array): number {
  values.sort((a, b) => a - b);
  const length = values.length;
  if (length % 2 === 0) {
    return (values[length / 2] + values[length / 2 - 1]) / 2;
  }

  return values[(length - 1) / 2];
}
