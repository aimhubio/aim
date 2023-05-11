import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useModel } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { PathEnum } from 'config/enums/routesEnum';

import boardAppModel from 'services/models/board/boardAppModel';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import { setDocumentTitle } from 'utils/document/documentTitle';

import Board from './Board';

function BoardContainer(): React.FunctionComponentElement<React.ReactNode> {
  const boardData = useModel(boardAppModel);
  const { params, path } = useRouteMatch<any>();
  const history = useHistory();

  React.useEffect(() => {
    boardAppModel.initialize(params.boardId);
    // TODO: add analytics for Board page
    // analytics.pageView(ANALYTICS_EVENT_KEYS.boards.pageView);
    return () => {
      // boardAppModel.destroy();
    };
  }, [params.boardId]);

  React.useEffect(() => {
    setDocumentTitle(boardData.board.name, true);
  }, [boardData.board.name]);

  const saveBoard = React.useCallback(
    async (data: any) => {
      if (params.boardId === 'new') {
        const newBoard = await boardAppModel.createBoard(
          data.name,
          data.description,
          data.code,
        );
        if (newBoard) {
          const url = PathEnum.Board_Edit.replace(':boardId', newBoard.id);
          history.push(url);
        }
      } else {
        await boardAppModel.updateBoard(params.boardId, {
          ...boardData.board,
          ...data,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.boardId, boardData.board],
  );

  return (
    <ErrorBoundary>
      {!boardData?.isLoading && (
        <Board
          data={boardData?.board!}
          isLoading={boardData?.isLoading!}
          editMode={path === PathEnum.Board_Edit}
          newMode={params.boardId === 'new'}
          notifyData={boardData?.notifyData as INotification[]}
          saveBoard={saveBoard}
          onNotificationDelete={boardAppModel.onBoardNotificationDelete}
        />
      )}
    </ErrorBoundary>
  );
}

export default BoardContainer;
