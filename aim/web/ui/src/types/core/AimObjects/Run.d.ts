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
  name: ?string;
  description: ?string;
  experiment: ?Experiment;
  tags: ?Array<Tag>;
  creation_time: number;
  end_time: ?number;
}

export interface RunInfo {
  params: Params;
  traces: Record<string, Array<SequenceOverview>>;
  props: RunProps;
}

export interface RunSearchRunView {
  hash: string;
  values: Array<any>;
  params: Params;
  traces: Array<SequenceFullView>;
  props: RunProps;
}
