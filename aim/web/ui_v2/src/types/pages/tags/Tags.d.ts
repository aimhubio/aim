export interface ITagsProps {
  tagsListData: ITagProps[];
  isTagsDataLoading: boolean;
  tagInfo: any;
  tagRuns: any;
  onNotificationDelete: any;
  notifyData: any;
  isTagsDataLoading: any;
  isRunsDataLoading: any;
  isTagInfoDataLoading: any;
}

export interface ITagProps {
  name: string;
  color: string | null;
  id: string;
  description: string;
  run_count: number;
  archived: boolean;
}

export interface ITagRunsProps {
  tagHash: string;
  tagRuns: ITagRun[];
}

export interface ITagSoftDeleteProps {
  modalIsOpen: boolean;
  tagHash: string;
  tagInfo: ITagInfo;
  onSoftDeleteModalToggle: () => void;
  onTagDetailOverlayToggle: () => void;
  isTagDetailOverLayOpened: boolean;
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
  onDeleteModalToggle: () => void;
  isTagInfoDataLoading: any;
  tagInfo: any;
  isRunsDataLoading: any;
  tagRuns: any;
}

export interface ITagRunsTableProps {
  runsList: ITagRun[];
}
export interface ITagsTableProps {
  tableRef: React.RefObject<any>;
  tagsList: ITagProps[];
  hasSearchValue: boolean;
  isTagsDataLoading: boolean;
  onTableRunClick: (id: string) => void;
  onSoftDeleteModalToggle: () => void;
  onUpdateModalToggle: () => void;
  onDeleteModalToggle: () => void;
}

export interface ITagsListProps {
  tagsList: ITagProps[];
  isHiddenTagsList?: boolean;
  isTagsDataLoading: boolean;
  tagInfo: any;
  tagRuns: any;
  isRunsDataLoading: boolean;
  isTagInfoDataLoading: boolean;
}
