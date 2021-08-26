import { omit } from 'lodash-es';

import projectsService from 'services/api/projects/projectsService';
import {
  IProject,
  IProjectParamsMetrics,
  IProjectsModelState,
} from 'types/services/models/projects/projectsModel';
import createModel from 'services/models/model';

const model = createModel<IProjectsModelState>({});

function getProjectsData() {
  const { call, abort } = projectsService.getProjectsData();

  model.init();

  return {
    call: () =>
      call().then((data: IProject) => {
        model.setState({
          project: data,
        });
      }),
    abort,
  };
}

function getParamsAndMetrics() {
  const { call, abort } = projectsService.getParamsAndMetrics();

  return {
    call: () =>
      call().then((data: IProjectParamsMetrics) => {
        model.setState({
          metrics: data.metrics,
          params: removeExampleTypes(data.params),
        });
      }),
    abort,
  };
}

function removeExampleTypes(params: IProjectParamsMetrics['params']) {
  for (let paramKey in params) {
    const param = params[paramKey];
    if (typeof param === 'object') {
      if (param.hasOwnProperty('__example_type__')) {
        params[paramKey] = true;
      } else {
        removeExampleTypes(param);
      }
    } else {
      params[paramKey] = true;
    }
  }
  return params;
}

const projectsModel = {
  ...model,
  getProjectsData,
  getParamsAndMetrics,
};

export default projectsModel;
