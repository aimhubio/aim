import React from 'react';

import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IBookmarksProps } from 'types/pages/bookmarks/Bookmarks';

import BookmarkCard from './components/BookmarkCard/BookmarkCard';

import './Bookmarks.scss';

function Bookmarks({
  data,
  onBookmarkDelete,
  isLoading,
}: IBookmarksProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <section className='Bookmarks'>
        <AppBar title='Bookmarks' />
        <div className='Bookmarks__list container'>
          <BusyLoaderWrapper isLoading={isLoading}>
            {data?.length > 0 &&
              data.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  {...bookmark}
                  onBookmarkDelete={onBookmarkDelete}
                />
              ))}
          </BusyLoaderWrapper>
          {!isLoading && data?.length === 0 ? (
            <EmptyComponent size='big' content={'No Bookmarks'} />
          ) : null}
        </div>
      </section>
    </ErrorBoundary>
  );
}

export default Bookmarks;
