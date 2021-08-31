import createModel from '../model';
import dashboardService from 'services/api/dashboard/dashboardService';
import appsService from 'services/api/apps/appsService';

const model = createModel<any>({});

function getBookmarksData() {
  const { call, abort } = dashboardService.fetchDashboardsList();
  return {
    call: () =>
      call().then(async (data: any) => {
        const appList = await appsService.fetchAppsList().call();
        console.log(appList);
        model.setState({
          listData: data,
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
