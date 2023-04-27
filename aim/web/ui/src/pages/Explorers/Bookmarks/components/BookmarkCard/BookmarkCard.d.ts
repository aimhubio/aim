import { IBookmarkProps } from '../../Bookmarks.d';

interface IBookmarkCardProps extends IBookmarkProps {
  onBookmarkDelete: (id: string) => void;
}
