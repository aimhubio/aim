import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import useModel from 'hooks/model/useModel';

import bookmarkAppModel from 'services/models/bookmarks/bookmarksAppModel';
import * as analytics from 'services/analytics';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import Bookmarks from './Bookmarks';

function BookmarksContainer(): React.FunctionComponentElement<React.ReactNode> {
  const bookmarksData = useModel(bookmarkAppModel);

  React.useEffect(() => {
    bookmarkAppModel.initialize();
    analytics.pageView(ANALYTICS_EVENT_KEYS.bookmarks.pageView);
    return () => {
      bookmarkAppModel.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Bookmarks
        data={bookmarksData?.listData!}
        isLoading={bookmarksData?.isLoading!}
        onBookmarkDelete={bookmarkAppModel.onBookmarkDelete}
        notifyData={bookmarksData?.notifyData as INotification[]}
        onNotificationDelete={bookmarkAppModel.onBookmarksNotificationDelete}
      />
    </ErrorBoundary>
  );
}

export default BookmarksContainer;
