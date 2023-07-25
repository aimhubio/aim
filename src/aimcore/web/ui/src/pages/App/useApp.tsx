import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { ANALYTICS_EVENT_KEYS_MAP } from 'config/analytics/analyticsKeysMap';

import useBoardStore from 'pages/Board/BoardStore';

import * as analytics from 'services/analytics';

function useApp() {
  const boardsList = useBoardStore((state) => state.boardsList);
  const fetchBoardsList = useBoardStore((state) => state.fetchBoardList);
  const isLoading = useBoardStore((state) => state.isLoading);
  const updateBoard = useBoardStore((state) => state.editBoard);
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  const boards = useBoardStore((state) => state.boards);
  const notifications = useBoardStore((state) => state.notifyData);
  const history = useHistory();
  const location = useLocation();

  const sortedList = React.useMemo(() => {
    const list = boardsList.sort();
    // Separate directories and files
    let dirs = list.filter((path) => path.includes('/'));
    let files = list.filter((path) => !path.includes('/'));
    // Prioritize directories, then files
    return [...dirs, ...files];
  }, [boardsList]);

  React.useEffect(() => {
    analytics.pageView(ANALYTICS_EVENT_KEYS_MAP.app.pageView);
    if (boardsList.length === 0) {
      fetchBoardsList();
    }
  }, []);

  React.useEffect(() => {
    if (!isLoading && sortedList.length > 0 && location.pathname === '/app') {
      const firstBoardPath = sortedList[0]; // replace this with the correct property if different
      history.replace(`/app/${firstBoardPath}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardsList, location]);

  return {
    data: sortedList,
    updateBoard,
    boards,
    isLoading,
    fetchBoard,
    notifications,
  };
}

export default useApp;
