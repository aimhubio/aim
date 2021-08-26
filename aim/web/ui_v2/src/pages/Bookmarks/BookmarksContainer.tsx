import React from 'react';

import useModel from 'hooks/model/useModel';
import bookmarkAppModel from 'services/models/bookmarks/bookmarksAppModel';
import Bookmarks from './Bookmarks';

function BookmarksContainer(): React.FunctionComponentElement<React.ReactNode> {
  const bookmarksRequestRef = React.useRef(bookmarkAppModel.getBookmarksData());
  const bookmarksData = useModel(bookmarkAppModel);

  React.useEffect(() => {
    bookmarkAppModel.initialize();
    bookmarksRequestRef.current.call();
    return () => {
      bookmarksRequestRef.current.abort();
    };
  }, []);

  return (
    <Bookmarks
      data={bookmarksData.listData}
      onBookmarkDelete={bookmarkAppModel.onBookmarkDelete}
    />
  );
}

export default BookmarksContainer;
