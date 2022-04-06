export const toTupleData = (x: number[], y: number[]): [number, number][] => {
  return x.map((v: number, i: number) => [v, y[i]]);
};

export const toQuadrupleData = (
  x0: number[],
  y0: number[],
  x1: number[],
  y1: number[],
): [number, number, number, number][] => {
  return x0.map((v: number, i: number) => [v, y0[i], x1[i], y1[i]]);
};
