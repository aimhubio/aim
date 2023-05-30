export const toTupleData = (
  x: number[],
  y: number[],
  cb?: (x: number, y: number) => void,
): [number, number][] => {
  let tupleData: [number, number][] = [];
  for (let i = 0; i < x.length; i++) {
    tupleData.push([x[i], y[i]]);
    cb?.(x[i], y[i]);
  }
  return tupleData;
};

export const toQuadrupleData = (
  x0: number[],
  y0: number[],
  x1: number[],
  y1: number[],
): [number, number, number, number][] => {
  return x0.map((v: number, i: number) => [v, y0[i], x1[i], y1[i]]);
};
