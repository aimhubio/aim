import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import * as _ from 'lodash-es';

import { ANALYTICS_EVENT_KEYS_MAP } from 'config/analytics/analyticsKeysMap';
import { PathEnum } from 'config/enums/routesEnum';

import useBoardStore from 'pages/Board/BoardStore';

import pyodideEngine, { usePyodideEngine } from 'services/pyodide/store';
import * as analytics from 'services/analytics';

function useApp() {
  const history = useHistory();
  const location = useLocation();

  const isLoading = useBoardStore((state) => state.isLoading);
  const updateBoard = useBoardStore((state) => state.editBoard);
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  const boards = useBoardStore((state) => state.boards);
  const notifications = useBoardStore((state) => state.notifyData);
  const appName = useBoardStore((state) => state.appName);
  const setAppName = useBoardStore((state) => state.setAppName);

  const allPackagesBoards = usePyodideEngine(pyodideEngine.boardsSelector);
  const boardsList: string[] = appName
    ? allPackagesBoards?.[appName] ?? []
    : [];

  const sortedList = React.useMemo(() => {
    const list = _.sortBy(boardsList);
    // Separate directories and files
    let dirs = list.filter((path) => path.includes('/'));
    let files = list.filter((path) => !path.includes('/'));
    // Prioritize directories, then files
    return [...dirs, ...files];
  }, [boardsList]);

  React.useEffect(() => {
    analytics.pageView(ANALYTICS_EVENT_KEYS_MAP.app.pageView);
  }, []);

  React.useEffect(() => {
    if (
      !isLoading &&
      appName &&
      sortedList.length > 0 &&
      location.pathname === PathEnum.App.replace(':appName', appName)
    ) {
      const firstBoardPath = sortedList[0]; // replace this with the correct property if different
      history.replace(
        `${PathEnum.App.replace(':appName', appName)}/${firstBoardPath}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardsList, location, appName]);

  return {
    data: sortedList,
    updateBoard,
    boards,
    isLoading,
    fetchBoard,
    notifications,
    appName,
    setAppName,
  };
}

export default useApp;
