import projectsService from '../../api/projects/projectsServie';
import createModel from '../model';

const model = createModel({});

function getProjectsData() {
  const { call, abort } = projectsService.getProjectsData();

  model.init();
  call().then((data) => {
    model.setState(data);
  });

  return {
    abort,
  };
}

const projectsModel = {
  ...model,
  getProjectsData,
};

export default projectsModel;
