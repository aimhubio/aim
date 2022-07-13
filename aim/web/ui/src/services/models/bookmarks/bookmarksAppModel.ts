import dashboardService from 'services/api/dashboard/dashboardService';
import appsService from 'services/api/apps/appsService';

import { IBookmarksAppModelState } from 'types/services/models/bookmarks/bookmarksAppModel';
import { IBookmarksData } from 'types/pages/bookmarks/Bookmarks';

import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';
import onNotificationDelete from 'utils/app/onNotificationDelete';

import createModel from '../model';

let bookmarksRequestRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<any>;
  abort: () => void;
};

const model = createModel<IBookmarksAppModelState>({
  isLoading: true,
  listData: [],
  notifyData: [],
});

function getBookmarksData() {
  const { call, abort } = dashboardService.fetchDashboardsList();
  return {
    call: () =>
      call().then(async (data: any) => {
        try {
          const appsList = await appsService
            .fetchAppsList()
            .call((detail: any) => {
              exceptionHandler({ detail, model: model as any });
            });
          const listData = data.map((item: any) => {
            const app = appsList.find(
              (appData: any) => appData.id === item.app_id,
            );
            return { ...item, select: app.state.select, type: app.type };
          });
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
      }),

    abort,
  };
}

function onBookmarksNotificationDelete(id: number) {
  onNotificationDelete({ id, model });
}

async function onBookmarkDelete(id: string) {
  try {
    model.setState({ isLoading: true });
    await dashboardService.deleteDashboard(id).call((detail: any) => {
      exceptionHandler({ detail, model });
    });
    const listData: IBookmarksData[] | any = model.getState()?.listData;
    const newListData = [...listData].filter((bookmark) => bookmark.id !== id);
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
    bookmarksRequestRef = getBookmarksData();
    bookmarksRequestRef.call((detail) => {
      exceptionHandler({ detail, model: model as any });
      model.setState({
        isLoading: false,
      });
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
    model.setState({
      isLoading: false,
    });
    bookmarksRequestRef.abort();
  }
}

function destroy() {
  bookmarksRequestRef.abort();
  model.destroy();
}
const bookmarkAppModel = {
  ...model,
  initialize,
  destroy,
  getBookmarksData,
  onBookmarkDelete,
  onBookmarksNotificationDelete,
};

export default bookmarkAppModel;
