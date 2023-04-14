import React from 'react';
import { useModel } from 'hooks';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';
import boardsAppModel from 'services/models/boards/boardsAppModel';

function useBoards() {
  const boardsData = useModel(boardsAppModel);

  React.useEffect(() => {
    boardsAppModel.initialize();
    analytics.pageView(ANALYTICS_EVENT_KEYS.boards.pageView);
    return () => {
      boardsAppModel.destroy();
    };
  }, []);

  const [searchValue, setSearchValue] = React.useState<string>('');

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { value } = e.target;
    setSearchValue(value);
  }

  const filteredBoards = React.useMemo(() => {
    if (!searchValue) {
      return boardsData?.listData;
    }

    return boardsData?.listData?.filter((board: any) => {
      return board.name.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [boardsData?.listData, searchValue]);

  return {
    searchValue,
    handleSearchChange,
    data: boardsData?.listData!,
    filteredBoards,
    isLoading: boardsData?.isLoading!,
    notifyData: boardsData?.notifyData,
    onBoardDelete: boardsAppModel.onBoardDelete,
    onNotificationDelete: boardsAppModel.onBoardsNotificationDelete,
  };
}

export default useBoards;
