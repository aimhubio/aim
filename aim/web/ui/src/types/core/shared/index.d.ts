export interface EncodedNumpyArray {
  type: string;
  shape: number;
  dtype: string;
  blob: Uint8Array;
}

export type Context = Record<string, any>;

export type Union<T, D> = T | D;

export type Tuple<T> = [T, T];

export type Record = {
  index?: number;
  step: number;
};

export type AllKeys<T> = T extends any ? keyof T : never;

export type Pick<T, K extends AllKeys<T>> = NonNullable<
  T extends { [key in K]: any } ? T[K] : null
>;

type PickTypeOf<T, K extends string | number | symbol> = K extends AllKeys<T>
  ? Pick<T, K>
  : Pick<T, AllKeys<T>>;

export type MergeUnion<T extends object> = {
  [keys in AllKeys<T>]: PickTypeOf<T, keys>;
};
