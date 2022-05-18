import { SequenceBaseView } from './Sequence';
import { Params, RunProps } from './Run';

type NumberTuple = [number, number];

export interface BaseRangeInfo {
  record_range_used: NumberTuple;
  record_range_total: NumberTuple;
  index_range_used: ?NumberTuple;
  index_range_total: ?NumberTuple;
}

export interface ObjectSequenceBase<T> extends BaseRangeInfo, SequenceBaseView {
  values: Array<T>;
}

export interface ObjectSequenceFullView extends SequenceBaseView {
  values: Array<any>;
  iters: Array<number>;
  epochs: Array<number>;
  timestamps: Array<number>;
}

export interface ObjectSearchRunView {
  params: Params;
  traces: Array<ObjectSequenceFullView>;
  ranges: BaseRangeInfo;
  props: RunProps;
}
