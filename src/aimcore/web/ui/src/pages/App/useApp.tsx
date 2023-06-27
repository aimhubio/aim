import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import useBoardStore from 'pages/Board/BoardStore';

function useApp() {
  const boardsList = useBoardStore((state) => state.boardsList);
  const pages = useBoardStore((state) => state.pages);
  const entry = useBoardStore((state) => state.entry);
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
    if (boardsList.length === 0) {
      fetchBoardsList();
    }
  }, []);

  React.useEffect(() => {
    if (!isLoading && sortedList.length > 0 && location.pathname === '/app') {
      if (entry) {
        history.replace(`/app/${entry}`);
      } else {
        const firstBoardPath = sortedList[0];
        history.replace(`/app/${firstBoardPath}`);
      }
    }
  }, [isLoading, sortedList, entry, location, history]);

  return {
    boardsList: sortedList,
    pages,
    updateBoard,
    boards,
    isLoading,
    fetchBoard,
    notifications,
  };
}

export default useApp;
