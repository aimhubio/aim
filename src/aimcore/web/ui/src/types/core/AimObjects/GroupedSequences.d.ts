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
  $properties: Record<string, any>;
  sequences: Array<T>;
}

export interface SequenceBase {
  name: string;
  item_type: string;
  range?: [number, number];
  context: Record<string, unknown>;
}

export interface Sequence_Metric extends SequenceBase {
  axis: Record<string, unknown>;
  axis_names: Array<string>;
  steps: Array<number>;
  values: Array<number>;
}
