export interface IndexRanges {
  index_range_total?: [number, number];
  index_range_used?: [number, number];
}

export interface RecordRanges {
  record_range_total?: [number, number];
  record_range_used?: [number, number];
}

export interface GroupedSequence<T = SequenceBase> {
  hash: string;
  params: Record<string, any>;
  sequences: Array<T>;
}

export interface SequenceBase {
  name: string;
  item_type: string;
  range?: [number, number];
}

export interface Sequence_Metric extends SequenceBase {
  axis: Record<string, unknown>;
  axis_names: Array<string>;
  context: Record<string, unknown>;
  steps: Array<number>;
  values: Array<number>;
}
