import projectsService from 'services/api/projects/projectsService';
import createModel from 'services/models/model';

import {
  IProject,
  IProjectParamsMetrics,
  IProjectsModelState,
} from 'types/services/models/projects/projectsModel';

const model = createModel<Partial<IProjectsModelState>>({});

function getProjectsData() {
  const { call, abort } = projectsService.getProjectsData();

  model.init();

  return {
    call: () =>
      call().then((data: IProject) => {
        //@ts-ignore
        window.telemetry_enabled = data.telemetry_enabled;
        model.setState({
          project: data,
        });
      }),
    abort,
  };
}

function getProjectParams(sequences: string[] = ['metric']) {
  const { call, abort } = projectsService.getProjectParams(sequences);

  return {
    call: () =>
      call().then((data: IProjectParamsMetrics) => {
        model.setState({
          metrics: data.metric,
          images: data.images,
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
  getProjectParams,
};

export default projectsModel;
