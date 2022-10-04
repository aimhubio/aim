import { Context, EncodedNumpyArray } from '../shared';

export interface SequenceBase {
  context: Context;
  name: string;
}

export interface SequenceOverview extends SequenceBase {
  last_value: number;
}

export interface SequenceBaseView extends SequenceBase {
  iters: Array<number>;
}

export interface Sequence extends SequenceBase {
  iters: Array<number>;
}

export interface MetricsBaseView extends SequenceBaseView {
  values: Array<number>;
}

export interface SequenceAlignedView extends SequenceBase {
  x_axis_values: EncodedNumpyArray | null;
  x_axis_iters: EncodedNumpyArray | null;
}

export interface SequenceFullView extends SequenceAlignedView {
  slice: [number, number, number];
  values: EncodedNumpyArray | null;
  epochs: Array<number>;
  iters: Array<number>;
  timestamps: EncodedNumpyArray | null;
}
