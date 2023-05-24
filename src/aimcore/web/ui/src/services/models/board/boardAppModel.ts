import { initialCode } from 'pages/Board/newBoardCode';

import appsService from 'services/api/apps/appsService';

import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';
import onNotificationDelete from 'utils/app/onNotificationDelete';

import createModel from '../model';

let boardRequestRef: {
  call: () => void;
  abort: () => void;
};

const model = createModel<any>({
  isLoading: true,
  board: {
    name: 'New Board',
    description: '',
    code: initialCode,
  },
  notifyData: [],
});

function getBoardData(boardId: string) {
  const { call, abort } = appsService.fetchApp(boardId);

  return {
    call: () => {
      call((detail: any) => {
        exceptionHandler({ detail, model: model as any });
      }).then(async (data: any) => {
        try {
          model.setState({
            isLoading: false,
            board: {
              ...data,
              ...data.state,
            },
          });
        } catch (err: any) {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              messages: [err.message],
              severity: 'error',
            },
            model: model as any,
          });
        }
        model.setState({ isLoading: false });
      });
    },
    abort,
  };
}

async function createBoard(name: string, description: string, code: string) {
  try {
    return await appsService
      .createApp({
        state: {
          name,
          description,
          code: code,
          board: true,
        } as any,
        type: 'board',
      })
      .call((detail: any) => {
        exceptionHandler({ detail, model });
      })
      .then((data: any) => {
        model.setState({
          board: {
            ...data,
            ...data.state,
          },
        });
        onNotificationAdd({
          notification: {
            id: Date.now(),
            severity: 'success',
            messages: ['Board successfully created'],
          },
          model,
        });

        return data;
      });
  } catch (err: any) {
    onNotificationAdd({
      notification: {
        id: Date.now(),
        messages: [err.message],
        severity: 'error',
      },
      model: model as any,
    });
  }
}

async function updateBoard(boardId: string, update: Record<string, unknown>) {
  try {
    await appsService
      .updateApp(boardId, {
        state: update,
        type: 'board',
      })
      .call((detail: any) => {
        exceptionHandler({ detail, model });
      })
      .then((data: any) => {
        model.setState({
          board: {
            ...data,
            ...data.state,
          },
        });
      });

    onNotificationAdd({
      notification: {
        id: Date.now(),
        severity: 'success',
        messages: ['Board successfully updated'],
      },
      model,
    });
  } catch (err: any) {
    onNotificationAdd({
      notification: {
        id: Date.now(),
        messages: [err.message],
        severity: 'error',
      },
      model: model as any,
    });
  }
}

function onBoardNotificationDelete(id: number) {
  onNotificationDelete({ id, model });
}

function initialize(boardId: string) {
  model.init();
  if (boardId === 'new') {
    model.setState({
      isLoading: false,
      board: {
        name: 'New Board',
        description: '',
        code: initialCode,
        board: true,
      },
    });
  } else {
    try {
      boardRequestRef = getBoardData(boardId);
      boardRequestRef.call();
    } catch (err: any) {
      onNotificationAdd({
        notification: {
          id: Date.now(),
          messages: [err.message],
          severity: 'error',
        },
        model: model as any,
      });
      model.setState({
        isLoading: false,
      });
      boardRequestRef.abort();
    }
  }
}

function destroy() {
  boardRequestRef?.abort();
  model.destroy();
}

const boardAppModel = {
  ...model,
  initialize,
  destroy,
  getBoardData,
  createBoard,
  updateBoard,
  onBoardNotificationDelete,
};

export default boardAppModel;
