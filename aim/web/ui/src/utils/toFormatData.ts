export const toTupleData = (x: number[], y: number[]): [number, number][] => {
  return x.map((v: number, i: number) => [v, y[i]]);
};

export const toQuadrupleData = (
  x1: number[],
  y1: number[],
  x2: number[],
  y2: number[],
): [number, number, number, number][] => {
  return x1.map((v: number, i: number) => [v, y1[i], x2[i], y2[i]]);
};
