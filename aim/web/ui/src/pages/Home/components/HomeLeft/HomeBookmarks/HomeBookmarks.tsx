import React from 'react';

import { IResourceState } from 'modules/core/utils/createResource';

import { Text } from 'components/kit';

import createBookmarksEngine from './HomeBookmarksStore';

function HomeBookmarks() {
  const { current: bookmarksEngine } = React.useRef(createBookmarksEngine);
  const bookmarksStore: IResourceState<any> = bookmarksEngine.bookmarksState(
    (state) => state,
  );

  React.useEffect(() => {
    bookmarksEngine.fetchBookmarks();
  }, []);

  return (
    <div className='HomeBookmarks'>
      <Text size={18}>Bookmarks</Text>
      <div className='HomeBookmarks__list'>
        {bookmarksStore.data?.map((experiment: any) => (
          <div key={experiment.id} className='HomeBookmarks__item'>
            <Text size={14}>{experiment.name}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(HomeBookmarks);
