import { SequenceFullView, SequenceOverview } from './Sequence';

export type Params = Record<string, any>;

export interface Tag {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface Experiment {
  id: string;
  name: string;
}

export interface RunProps {
  hash: string;
  name: string | null;
  description: string | null;
  experiment: Experiment | null;
  tags: Array<Tag> | null;
  creation_time: number;
  end_time: number | null;
}

export interface RunInfo {
  params: Params;
  traces: Record<string, Array<SequenceOverview>>;
  props: RunProps;
}

export interface IndexRanges {
  index_range_total?: [number, number];
  index_range_used?: [number, number];
}

export interface RecordRanges {
  record_range_total?: [number, number];
  record_range_used?: [number, number];
}

export interface RunSearchRunView {
  hash: string;
  values: Array<any>;
  params: Params;
  traces: Array<SequenceFullView>;
  props: RunProps;
  ranges?: IndexRanges & RecordRanges;
}

export interface Container extends RunSearchRunView {}
