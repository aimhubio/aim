import { BoardData } from 'modules/core/api/boardsApi';

export interface AppStructureProps {
  boards: string[];
  editMode: boolean;
}

export interface AppWrapperProps {
  boardPath: string;
  editMode: boolean;
  boardList: string[];
}
