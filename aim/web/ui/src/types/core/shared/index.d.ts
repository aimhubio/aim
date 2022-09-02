export interface EncodedNumpyArray {
  type: string;
  shape: number;
  dtype: string;
  blob: any; // @TODO find a way to indicate byte
}

export type Context = Record<string, any>;

export type Union<T, D> = T | D;

export type Tuple<T> = [T, T];

export type Record = {
  index?: number;
  step: number;
};
