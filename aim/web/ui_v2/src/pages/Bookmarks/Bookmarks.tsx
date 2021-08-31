import React from 'react';

import BookmarkCard from './components/BookmarkCard/BookmarkCard';
import { IBookmarksProps } from 'types/pages/bookmarks/Bookmarks';
import { IDashboardData } from 'types/services/models/metrics/metricsAppModel';
import AppBar from 'components/AppBar/AppBar';

import './Bookmarks.scss';

function Bookmarks({
  data,
  onBookmarkDelete,
}: IBookmarksProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Bookmarks'>
      <AppBar title='Bookmarks List' />
      <div className='Bookmarks__list container'>
        {data?.length > 0 &&
          data.map((bookmark: IDashboardData) => (
            <BookmarkCard
              key={bookmark.id}
              {...bookmark}
              onBookmarkDelete={onBookmarkDelete}
            />
          ))}
      </div>
    </section>
  );
}

export default Bookmarks;
