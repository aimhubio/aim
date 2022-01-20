import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import useModel from 'hooks/model/useModel';

import bookmarkAppModel from 'services/models/bookmarks/bookmarksAppModel';
import * as analytics from 'services/analytics';

import { IBookmarksAppModelState } from 'types/services/models/bookmarks/bookmarksAppModel';

import Bookmarks from './Bookmarks';

function BookmarksContainer(): React.FunctionComponentElement<React.ReactNode> {
  const bookmarksRequestRef = React.useRef(bookmarkAppModel.getBookmarksData());
  const bookmarksData = useModel(bookmarkAppModel);

  React.useEffect(() => {
    bookmarkAppModel.initialize();
    bookmarksRequestRef.current.call();
    analytics.pageView('[Bookmarks]');
    return () => {
      bookmarksRequestRef.current.abort();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Bookmarks
        data={bookmarksData?.listData as IBookmarksAppModelState['listData']}
        isLoading={bookmarksData?.isLoading as boolean}
        onBookmarkDelete={bookmarkAppModel.onBookmarkDelete}
      />
    </ErrorBoundary>
  );
}

export default BookmarksContainer;
