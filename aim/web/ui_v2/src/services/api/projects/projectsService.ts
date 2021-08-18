import API from '../api';
import { IProject } from 'types/services/models/projects/projectsModel';
import { IApiRequest } from 'types/services/services';

const endpoints = {
  GET_PROJECTS: 'projects',
  GET_ACTIVITIES: 'projects/activity',
};

function getProjectsData(): IApiRequest<IProject> {
  return API.get<IProject>(endpoints.GET_PROJECTS);
}

function fetchActivityData(): IApiRequest<any> {
  return API.get(endpoints.GET_ACTIVITIES);
}

const projectsService = {
  endpoints,
  getProjectsData,
  fetchActivityData,
};

export default projectsService;
