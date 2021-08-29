export interface ITagsProps {
  tagsListData: ITagProps[];
}

export interface ITagProps {
  name: string;
  color: string | null;
  id: string;
  run_count: number;
  archived: boolean;
}

export interface ITagRunsProps {
  tagHash: string;
  tagRuns: ITagRun[];
}

export interface ITagSoftDeleteProps {
  tagHash: string;
  tagInfo: ITagInfo;
  onSoftDeleteModalToggle: () => void;
  onTagDetailOverlayToggle: () => void;
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
  comment: string;
  name: string;
  run_count: number;
}
export interface ITagDetailProps {
  id: string;
  onSoftDeleteModalToggle: () => void;
  onUpdateModalToggle: () => void;
}

export interface ITagRunsTableProps {
  runList: ITagRun[];
}

export interface ITagsTableProps {
  tagsList;
  onTableRunClick: (e: MouseEvent, id: string) => void;
}
