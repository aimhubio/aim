import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import useBoardStore from 'pages/Board/BoardStore';

function useApp() {
  const boardsList = useBoardStore((state) => state.boardsList);
  const fetchBoardsList = useBoardStore((state) => state.fetchBoardList);
  const isLoading = useBoardStore((state) => state.isLoading);
  const updateBoard = useBoardStore((state) => state.editBoard);
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  const notifications = useBoardStore((state) => state.notifyData);
  const destroy = useBoardStore((state) => state.destroy);
  const history = useHistory();
  const location = useLocation();

  React.useEffect(() => {
    fetchBoardsList();
    return () => {
      destroy();
    };
  }, []);

  React.useEffect(() => {
    if (!isLoading && boardsList.length > 0 && location.pathname === '/app') {
      const firstBoardPath = boardsList[0]; // replace this with the correct property if different
      history.push(`/app/${firstBoardPath}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardsList]);

  return {
    data: boardsList,
    updateBoard,
    isLoading,
    fetchBoard,
    notifications,
  };
}

export default useApp;
