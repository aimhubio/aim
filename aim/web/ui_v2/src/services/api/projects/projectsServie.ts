import API from '../api';

const endpoints = {
  GET_PROJECTS: '/projects',
};

function getProjectsData() {
  return API.get(endpoints.GET_PROJECTS);
}

const projectsService = {
  endpoints,
  getProjectsData,
};

export default projectsService;
