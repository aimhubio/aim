import appsService from 'services/api/apps/appsService';

import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';
import onNotificationDelete from 'utils/app/onNotificationDelete';

import createModel from '../model';

let boardsRequestRef: {
  call: () => void;
  abort: () => void;
};

const model = createModel<any>({
  isLoading: true,
  listData: [],
  notifyData: [],
});

function getBoardsData() {
  const { call, abort } = appsService.fetchAppsList();

  return {
    call: () => {
      call((detail: any) => {
        exceptionHandler({ detail, model: model as any });
      }).then(async (data: any) => {
        try {
          const listData = data
            .filter((item: any) => item.type === 'board')
            .map((item: any) => ({
              ...item,
              ...item.state,
            }))
            .sort(
              (a: any, b: any) =>
                Date.parse(b.updated_at) - Date.parse(a.updated_at),
            );
          model.setState({
            isLoading: false,
            listData,
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

function onBoardsNotificationDelete(id: number) {
  onNotificationDelete({ id, model });
}

async function onBoardDelete(id: string) {
  try {
    model.setState({ isLoading: true });
    await appsService.deleteApp(id).call((detail: any) => {
      exceptionHandler({ detail, model });
    });
    const listData: any = model.getState()?.listData;
    const newListData = [...listData].filter((board) => board.id !== id);
    model.setState({
      listData: newListData,
      isLoading: false,
    });
  } catch (err: any) {
    model.setState({
      isLoading: false,
    });
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

function initialize() {
  model.init();
  try {
    boardsRequestRef = getBoardsData();
    boardsRequestRef.call();
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
    boardsRequestRef.abort();
  }
}

function destroy() {
  boardsRequestRef.abort();
  model.destroy();
}

const boardsAppModel = {
  ...model,
  initialize,
  destroy,
  getBoardsData,
  onBoardDelete,
  onBoardsNotificationDelete,
};

export default boardsAppModel;
