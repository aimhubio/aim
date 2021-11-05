import dashboardService from 'services/api/dashboard/dashboardService';
import appsService from 'services/api/apps/appsService';
import * as analytics from 'services/analytics';

import { IBookmarksAppModelState } from 'types/services/models/bookmarks/bookmarksAppModel';
import { IBookmarksData } from 'types/pages/bookmarks/Bookmarks';

import createModel from '../model';

const model = createModel<Partial<IBookmarksAppModelState>>({
  isLoading: true,
  listData: [],
});

function getBookmarksData() {
  const { call, abort } = dashboardService.fetchDashboardsList();
  return {
    call: () =>
      call().then(async (data: any) => {
        const appsList = await appsService.fetchAppsList().call();
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
      }),
    abort,
  };
}

async function onBookmarkDelete(id: string) {
  try {
    model.setState({ isLoading: true });
    await dashboardService.deleteDashboard(id).call();
    const listData: IBookmarksData[] | any = model.getState()?.listData;
    const newListData = [...listData].filter((bookmark) => bookmark.id !== id);
    model.setState({
      listData: newListData,
      isLoading: false,
    });
    analytics.trackEvent('[Bookmarks] Delete a bookmark');
  } catch (err) {
    console.log(err);
  }
}
function initialize() {
  model.init();
}
const bookmarkAppModel = {
  ...model,
  initialize,
  getBookmarksData,
  onBookmarkDelete,
};

export default bookmarkAppModel;
