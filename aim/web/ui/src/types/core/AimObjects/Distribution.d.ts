import { EncodedNumpyArray } from '../shared';

export interface Distribution {
  data: EncodedNumpyArray;
  bin_count: number;
  range: [number, number];
}
