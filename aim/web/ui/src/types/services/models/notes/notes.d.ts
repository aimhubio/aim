import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

export interface INoteReqBody {
  name: string;
  content: string;
}

export interface INote {
  name: string;
  content: string;
  id: number;
  created_at: string;
  updated_at?: string;
}

export interface INotesAppModelState {
  isLoading: boolean;
  noteData: INote;
  notifyData: INotification[];
}

export type INotesList = INote[];
