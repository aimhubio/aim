import { BoardData } from 'modules/core/api/boardsApi';

export interface AppStructureProps {
  boards: BoardData[];
  editMode: boolean;
}

export interface AppWrapperProps {
  boardId: string;
  editMode: boolean;
  boardList: BoardData[];
}
