import React from 'react';
import { useModel } from 'hooks';

import boardsAppModel from 'services/models/boards/boardsAppModel';

function useApp() {
  const appData = useModel(boardsAppModel);

  React.useEffect(() => {
    if (appData.isLoading) {
      boardsAppModel.initialize();
    }
    return () => {
      boardsAppModel.destroy();
    };
  }, []);

  return {
    data: appData.listData,
    isLoading: appData.isLoading,
  };
}

export default useApp;
