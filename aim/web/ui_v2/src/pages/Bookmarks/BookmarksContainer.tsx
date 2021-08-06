import React from 'react';

import useModel from 'hooks/model/useModel';
import bookmarkAppModel from 'services/models/bookmarks/bookmarksAppModel';
import Bookmarks from './Bookmarks';

const bookmarksRequestRef = bookmarkAppModel.getBookmarksData();

function BookmarksContainer(): React.FunctionComponentElement<React.ReactNode> {
  const bookmarksData = useModel(bookmarkAppModel);

  React.useEffect(() => {
    bookmarkAppModel.initialize();
    bookmarksRequestRef.call();
    return () => {
      bookmarksRequestRef.abort();
    };
  }, []);
  return <Bookmarks data={bookmarksData.listData} />;
}

export default BookmarksContainer;
