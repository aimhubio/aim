import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import useModel from 'hooks/model/useModel';

import bookmarkAppModel from 'services/models/bookmarks/bookmarksAppModel';
import * as analytics from 'services/analytics';

import { IBookmarksAppModelState } from 'types/services/models/bookmarks/bookmarksAppModel';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import Bookmarks from './Bookmarks';

function BookmarksContainer(): React.FunctionComponentElement<React.ReactNode> {
  const bookmarksData = useModel(bookmarkAppModel);

  React.useEffect(() => {
    bookmarkAppModel.initialize();
    analytics.pageView('[Bookmarks]');
  }, []);

  return (
    <ErrorBoundary>
      <Bookmarks
        data={bookmarksData?.listData as IBookmarksAppModelState['listData']}
        isLoading={bookmarksData?.isLoading as boolean}
        onBookmarkDelete={bookmarkAppModel.onBookmarkDelete}
        notifyData={bookmarksData?.notifyData as INotification[]}
        onNotificationDelete={bookmarkAppModel.onBookmarksNotificationDelete}
      />
    </ErrorBoundary>
  );
}

export default BookmarksContainer;
