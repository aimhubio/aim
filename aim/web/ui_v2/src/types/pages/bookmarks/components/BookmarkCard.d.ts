import { IBookmarksData, IBookmarksProps } from '../Bookmarks';

export interface IBookmarkCardProps extends IBookmarksData {
  onBookmarkDelete: IBookmarksProps['onBookmarkDelete'];
}
