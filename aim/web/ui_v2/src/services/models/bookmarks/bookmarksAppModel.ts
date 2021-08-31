import createModel from '../model';
import dashboardService from 'services/api/dashboard/dashboardService';
import appsService from 'services/api/apps/appsService';

const model = createModel<any>({});

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
          listData,
        });
      }),
    abort,
  };
}

async function onBookmarkDelete(id: string) {
  try {
    await dashboardService.deleteDashboard(id).call();
    const newListData = [...model.getState().listData].filter(
      (bookmark) => bookmark.id !== id,
    );
    model.setState({
      listData: newListData,
    });
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
