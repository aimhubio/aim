import API from '../api';
import { IProject } from 'types/services/models/projects/projectsModel';
import { IApiRequest } from 'types/services/services';

const endpoints = {
  GET_PROJECTS: 'projects',
};

function getProjectsData(): IApiRequest<IProject> {
  return API.get<IProject>(endpoints.GET_PROJECTS);
}

const projectsService = {
  endpoints,
  getProjectsData,
};

export default projectsService;
