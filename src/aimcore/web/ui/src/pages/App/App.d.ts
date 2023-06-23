import { BoardData } from 'modules/core/api/boardsApi';

export interface AppSidebarProps {
  boards: string[];
  pages: Record<string, any>;
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
  boardsList: string[];
  pages: Record<string, any>;
}
