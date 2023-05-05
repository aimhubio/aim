import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { IBookmarksData } from 'types/pages/bookmarks/Bookmarks';

export interface IBookmarksAppModelState {
  isLoading: boolean;
  listData: IBookmarksData[];
  notifyData: INotification[];
}
