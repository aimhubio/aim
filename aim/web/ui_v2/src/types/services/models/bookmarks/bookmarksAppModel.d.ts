import { IBookmarksData } from 'types/pages/bookmarks/Bookmarks';

export interface IBookmarksAppModelState {
  isLoading: boolean;
  listData: IBookmarksData[];
}
