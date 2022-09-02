import React from 'react';

import { Text } from 'components/kit';

import useHomeBookmarksStore from './HomeBookmarksStore';

function HomeBookmarks() {
  const bookmarksStore = useHomeBookmarksStore((store: any) => store);
  const bookmarks = bookmarksStore.bookmarks;
  React.useEffect(() => {
    bookmarksStore.fetchBookmarks();
  }, []);

  console.log('experiments', bookmarks);
  return (
    <div className='HomeBookmarks'>
      <Text size={18}>Bookmarks</Text>
      {}
      <div className='HomeBookmarks__list'>
        {bookmarks?.map((experiment: any) => (
          <div key={experiment.id} className='HomeBookmarks__item'>
            <Text size={14}>{experiment.name}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(HomeBookmarks);
