import React from 'react';
import { useModel } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import boardsAppModel from 'services/models/boards/boardsAppModel';
import * as analytics from 'services/analytics';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import Boards from './Boards';

function BoardsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const boardsData = useModel(boardsAppModel);

  React.useEffect(() => {
    boardsAppModel.initialize();
    analytics.pageView(ANALYTICS_EVENT_KEYS.boards.pageView);
    return () => {
      boardsAppModel.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Boards
        data={boardsData?.listData!}
        isLoading={boardsData?.isLoading!}
        notifyData={boardsData?.notifyData as INotification[]}
        onBoardDelete={boardsAppModel.onBoardDelete}
        onNotificationDelete={boardsAppModel.onBoardsNotificationDelete}
      />
    </ErrorBoundary>
  );
}

export default BoardsContainer;
