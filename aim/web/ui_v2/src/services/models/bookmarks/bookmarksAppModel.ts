import createModel from '../model';
import dashboardService from 'services/api/dashboard/dashboardService';

const model = createModel<any>({});

function getBookmarksData() {
  const { call, abort } = dashboardService.fetchBookmarks();
  return {
    call: () =>
      call().then((data: any) => {
        model.setState({
          listData: data,
        });
      }),
    abort,
  };
}

function initialize() {
  model.init();
}
const bookmarkAppModel = {
  ...model,
  initialize,
  getBookmarksData,
};

export default bookmarkAppModel;
