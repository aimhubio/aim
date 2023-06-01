import { BoardData } from 'modules/core/api/boardsApi';

export interface AppSidebarProps {
  boards: string[];
  editMode: boolean;
}

export type AppSidebarNode = {
  title: string | React.ReactNode;
  key: string;
  value: string;
  children?: AppSidebarNode[];
};

export interface AppWrapperProps {
  boardPath: string;
  editMode: boolean;
  boardList: string[];
}
