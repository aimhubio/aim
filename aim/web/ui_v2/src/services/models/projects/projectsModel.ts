import projectsService from "../../api/projects/projectsServie";

const initialState = {};

const state = {};

function initState() {
  Object.assign(state, initState);
}

function getState() {
  return state;
}

function setState(stateUpdate: unknown) {
  Object.assign(state, stateUpdate);
}

function getProjectData() {
  const request = projectsService.getProjectsData();
  request.call();
}

export {};
