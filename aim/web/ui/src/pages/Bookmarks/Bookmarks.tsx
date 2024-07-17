import React from 'react';

import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import pageTitlesEnum from 'config/pageTitles/pageTitles';
import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

import { IBookmarksProps } from 'types/pages/bookmarks/Bookmarks';

import BookmarkCard from './components/BookmarkCard/BookmarkCard';

import './Bookmarks.scss';

function Bookmarks({
  data,
  onBookmarkDelete,
  isLoading,
  notifyData,
  onNotificationDelete,
}: IBookmarksProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <section className='Bookmarks'>
        <AppBar
          title={pageTitlesEnum.BOOKMARKS}
          className='Bookmarks__appBar'
        />
        <div className='Bookmarks__container'>
          <div className='Bookmarks__list'>
            <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
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
                title={'No Bookmarks Yet'}
              />
            ) : null}
          </div>
        </div>
      </section>
      {notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={onNotificationDelete}
          data={notifyData}
        />
      )}
    </ErrorBoundary>
  );
}

export default Bookmarks;
