import React from 'react';

import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';

import { IBookmarksProps } from 'types/pages/bookmarks/Bookmarks';

import BookmarkCard from './components/BookmarkCard/BookmarkCard';

import './Bookmarks.scss';

function Bookmarks({
  data,
  onBookmarkDelete,
  isLoading,
}: IBookmarksProps): React.FunctionComponentElement<React.ReactNode> {
  let d = [];
  return (
    <section className='Bookmarks'>
      <AppBar title='Bookmarks' />
      <div className='Bookmarks__list container'>
        <BusyLoaderWrapper isLoading={isLoading}>
          {d?.length > 0 &&
            data.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                {...bookmark}
                onBookmarkDelete={onBookmarkDelete}
              />
            ))}
        </BusyLoaderWrapper>
        {!isLoading && d?.length === 0 ? (
          <EmptyComponent
            size='xLarge'
            imageName='emptyBookmarks'
            content={'No Bookmarks Yet'}
          />
        ) : null}
      </div>
    </section>
  );
}

export default Bookmarks;
