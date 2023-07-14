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
