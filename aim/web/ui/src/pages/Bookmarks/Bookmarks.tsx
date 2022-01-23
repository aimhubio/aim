import React from 'react';

import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

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
            <IllustrationBlock
              size='xLarge'
              page='bookmarks'
              type={IllustrationsEnum.EmptyBookmarks}
              content={'No Bookmarks Yet'}
            />
          ) : null}
        </div>
      </section>
    </ErrorBoundary>
  );
}

export default Bookmarks;
