import API from '../api';
import {
  IProject,
  IProjectParamsMetrics,
} from 'types/services/models/projects/projectsModel';
import { IApiRequest } from 'types/services/services';

const endpoints = {
  GET_PROJECTS: 'projects',
  GET_ACTIVITIES: 'projects/activity',
  GET_PARAMS_METRICS: 'projects/params',
};

function getProjectsData(): IApiRequest<IProject> {
  return API.get<IProject>(endpoints.GET_PROJECTS);
}

function fetchActivityData(): IApiRequest<any> {
  return API.get(endpoints.GET_ACTIVITIES);
}

function getParamsAndMetrics(): IApiRequest<IProjectParamsMetrics> {
  return API.get<IProjectParamsMetrics>(endpoints.GET_PARAMS_METRICS);
}

const projectsService = {
  endpoints,
  getProjectsData,
  fetchActivityData,
  getParamsAndMetrics,
};

export default projectsService;
