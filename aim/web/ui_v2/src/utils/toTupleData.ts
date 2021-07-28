export const toTupleData = (
  x: number[] | string[],
  y: number[] | string[],
): [number | string, number | string][] => {
  return x.map((v: number | string, i: number) => [v, y[i]]);
};
