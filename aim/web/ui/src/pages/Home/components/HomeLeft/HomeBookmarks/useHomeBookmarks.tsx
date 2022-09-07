import React from 'react';
import { useHistory } from 'react-router-dom';

import { IResourceState } from 'modules/core/utils/createResource';
import { IDashboardData } from 'modules/core/api/dashboardsApi';

import createBookmarksEngine from './HomeBookmarksStore';

function useHomeBookmarks() {
  const history = useHistory();
  const { current: bookmarksEngine } = React.useRef(createBookmarksEngine);
  const bookmarksStore: IResourceState<IDashboardData> =
    bookmarksEngine.bookmarksState((state) => state);

  React.useEffect(() => {
    bookmarksEngine.fetchBookmarks();
    return () => {
      bookmarksEngine.bookmarksState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick: (
    e: React.MouseEvent<HTMLElement>,
    dashboard: IDashboardData,
    newTab?: boolean,
  ) => void = React.useCallback(
    (
      e: React.MouseEvent<HTMLElement>,
      dashboard: IDashboardData,
      newTab = false,
    ) => {
      e.stopPropagation();
      if (dashboard) {
        const path = `${dashboard.app_type}/${dashboard.app_id}`;
        if (newTab) {
          window.open(path, '_blank');
          window.focus();
          return;
        }
        history.push(path);
      }
    },
    [history],
  );

  return { handleClick, bookmarksStore };
}

export default useHomeBookmarks;
