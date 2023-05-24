import {
  IPinnedSequencesResData,
  IProject,
  IProjectParamsMetrics,
} from 'types/services/models/projects/projectsModel';
import { IApiRequest } from 'types/services/services';

import API from '../api';

const endpoints = {
  GET_PROJECTS: 'projects',
  GET_ACTIVITIES: 'projects/activity',
  GET_PROJECTS_PARAMS: 'projects/params',
  PINNED_SEQUENCES: 'projects/pinned-sequences',
};

function getProjectsData(): IApiRequest<IProject> {
  return API.get<IProject>(endpoints.GET_PROJECTS);
}

function fetchActivityData(): IApiRequest<any> {
  return API.get(endpoints.GET_ACTIVITIES);
}

function getProjectParams(
  sequences: string[] = ['metric'],
): IApiRequest<IProjectParamsMetrics> {
  const query = sequences.reduce(
    (acc: string, sequence: string, index: number) => {
      acc += `${index === 0 ? '?' : '&'}sequence=${sequence}`;
      return acc;
    },
    '',
  );
  return API.get<IProjectParamsMetrics>(endpoints.GET_PROJECTS_PARAMS + query);
}

function getPinnedSequences(): IApiRequest<IPinnedSequencesResData> {
  return API.get(endpoints.PINNED_SEQUENCES);
}

function setPinnedSequences(
  body: IPinnedSequencesResData,
): IApiRequest<IPinnedSequencesResData> {
  return API.post(endpoints.PINNED_SEQUENCES, body);
}

const projectsService = {
  endpoints,
  getProjectsData,
  fetchActivityData,
  getProjectParams,
  getPinnedSequences,
  setPinnedSequences,
};

export default projectsService;
