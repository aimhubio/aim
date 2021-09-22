import createModel from '../model';
import projectsService from 'services/api/projects/projectsService';

const model = createModel<any>({});

function getActivityData() {
  const { call, abort } = projectsService.fetchActivityData();
  return {
    call: () =>
      call().then((data: any) => {
        model.setState({
          activityData: data,
        });
      }),
    abort,
  };
}

function initialize() {
  model.init();
}
const homeAppModel = {
  ...model,
  initialize,
  getActivityData,
};

export default homeAppModel;
