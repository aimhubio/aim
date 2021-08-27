import React from 'react';
import { Divider, Grid } from '@material-ui/core';

import BookmarkCard from './components/BookmarkCard/BookmarkCard';
import { IBookmarksProps } from 'types/pages/bookmarks/Bookmarks';
import { IDashboardData } from 'types/services/models/metrics/metricsAppModel';

import './Bookmarks.scss';

function Bookmarks({
  data,
  onBookmarkDelete,
}: IBookmarksProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Bookmarks'>
      <Grid container justifyContent='center'>
        <Grid xs={8} item>
          <h3 className='Bookmarks__title'>Bookmarks List</h3>
          <Divider />
          <div className='Bookmarks__list'>
            <Grid container spacing={1}>
              {data?.length > 0 &&
                data.map((bookmark: IDashboardData) => (
                  <Grid key={bookmark.id} item xs={4}>
                    <BookmarkCard
                      {...bookmark}
                      onBookmarkDelete={onBookmarkDelete}
                    />
                  </Grid>
                ))}
            </Grid>
          </div>
        </Grid>
      </Grid>
    </section>
  );
}

export default Bookmarks;
