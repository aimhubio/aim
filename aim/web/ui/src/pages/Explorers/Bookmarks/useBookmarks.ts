import React from 'react';

import useBookmarksStore from './BookmarksStore';
import { IBookmarkProps } from './Bookmarks.d';

/**
 * @description bookmarks hook for bookmarks list
 * @returns {object} bookmarks, isLoading, searchValue, filterValue, handleSearchChange, handleFilterChange, onBookmarkDelete
 * @example
 * const { bookmarks, isLoading, searchValue, filterValue, handleSearchChange, handleFilterChange, onBookmarkDelete } = useBookmarks();
 */

function useBookmarks(): {
  bookmarks: IBookmarkProps[];
  filteredBookmarks: IBookmarkProps[];
  isLoading: boolean;
  searchValue: string;
  filterValue: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterChange: (val: string) => void;
  onBookmarkDelete: (id: string) => void;
} {
  const { bookmarks, isLoading } = useBookmarksStore();
  const getBookmarks = useBookmarksStore((state) => state.getBookmarks);
  const destroy = useBookmarksStore((state) => state.destroy);
  const onBookmarkDelete = useBookmarksStore((state) => state.onBookmarkDelete);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [filterValue, setFilterValue] = React.useState<string>('all');

  React.useEffect(() => {
    getBookmarks();
    return () => {
      destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { value } = e.target;
    setSearchValue(value);
  }
  function handleFilterChange(val: string): void {
    setFilterValue(val);
  }

  const filteredBookmarks = React.useMemo(() => {
    const bookmarksList =
      filterValue === 'all' || filterValue === ''
        ? bookmarks
        : bookmarks.filter((bookmark) => bookmark.type === filterValue);
    if (searchValue === '') {
      return bookmarksList;
    }

    return bookmarksList.filter((bookmark) => {
      return bookmark.name.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [bookmarks, searchValue, filterValue]);

  return {
    bookmarks,
    filteredBookmarks,
    isLoading,
    searchValue,
    filterValue,
    handleSearchChange,
    handleFilterChange,
    onBookmarkDelete,
  };
}

export default useBookmarks;
