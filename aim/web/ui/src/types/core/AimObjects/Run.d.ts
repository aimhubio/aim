import { SequenceOverview } from './Sequence';

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
  params: Params;
  traces: Array<SequenceOverview>;
  props: RunProps;
}
