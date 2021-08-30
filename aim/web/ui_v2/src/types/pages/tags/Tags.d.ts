export interface ITagsProps {
  tagsList: ITagProps[];
}

export interface ITagProps {
  name: string;
  color: string | null;
  id: string;
  run_count: number;
}

export interface ITagRunsProps {
  tagHash: string;
  tagRuns: ITagRun[];
}

export interface ITagSettingsProps {
  tagHash: string;
  tagInfo: ITagInfo;
}

export interface ITagRun {
  creation_time: number;
  experiment: string | null;
  name: string;
  run_id: string;
}
export interface ITagInfo {
  archived: boolean;
  color: string;
  id: string;
  name: string;
  run_count: number;
}
