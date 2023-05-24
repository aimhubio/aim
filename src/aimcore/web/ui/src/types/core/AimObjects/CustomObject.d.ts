import { Tuple } from '../shared';

import { SequenceBaseView } from './Sequence';
import { Params, RunProps } from './Run';

export interface BaseRangeInfo {
  record_range_used: Tuple<number>;
  record_range_total: Tuple<number>;
  index_range_used: Tuple<number> | null;
  index_range_total: Tuple<number> | null;
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
