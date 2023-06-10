export interface IndexRanges {
  index_range_total?: [number, number];
  index_range_used?: [number, number];
}

export interface RecordRanges {
  record_range_total?: [number, number];
  record_range_used?: [number, number];
}

export interface GroupedSequence<T = any> {
  hash: string;
  params: Record<string, any>;
  sequences: Array<T>;
  ranges?: IndexRanges & RecordRanges;
}

export interface Sequence_Metric {
  axis: Record<string, unknown>;
  axis_names: Array<string>;
  context: Record<string, unknown>;
  item_type: string;
  name: string;
  steps: Array<number>;
  values: Array<number>;
}
