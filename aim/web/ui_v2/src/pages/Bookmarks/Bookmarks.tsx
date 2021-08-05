import React from 'react';
import { Divider, Grid } from '@material-ui/core';

import BookmarkCard from './components/BookmarkCard/BookmarkCard';
import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';

import './bookmarksStyle.scss';

const bookmarkList: IBookmarkCardProps[] = [
  {
    name: 'bookmark 1',
    selectLabel: '111',
    ifLabel: '123',
    path: '',
  },
  {
    name: 'bookmark 2',
    selectLabel: '111',
    ifLabel: '123',
    path: '',
  },
  {
    name: 'bookmark 3',
    selectLabel: '111',
    ifLabel: '123',
    path: '',
  },
  {
    name: 'bookmark 4',
    selectLabel: '111',
    ifLabel: '123',
    path: '',
  },
];
function Bookmarks(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Bookmarks'>
      <Grid container justify='center'>
        <Grid xs={8} item>
          <h3 className='Bookmarks__title'>Bookmarks List</h3>
          <Divider />
          <div className='Bookmarks__list'>
            <Grid container spacing={1}>
              {bookmarkList.map((bookmark) => (
                <Grid key={bookmark.name} item xs={4}>
                  <BookmarkCard {...bookmark} />
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
