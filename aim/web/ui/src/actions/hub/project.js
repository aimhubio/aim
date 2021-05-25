import * as actionTypes from '../actionTypes';
import callApi from '../../services/api';

export function getProject() {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Project.getProject')
        .then((data) => {
          dispatch({
            type: actionTypes.HUB_PROJECT,
            data,
          });
          resolve(data);
        })
        .catch((err) => {
          dispatch({
            type: actionTypes.HUB_PROJECT_NOT_FOUND,
          });
          reject(err);
        });
    });
  };
}

export function getProjectData() {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: actionTypes.HUB_PROJECT_UPDATE_START,
      });
      callApi('Project.getProjectData')
        .then((data) => {
          dispatch({
            type: actionTypes.HUB_PROJECT_UPDATE,
            data,
          });
          resolve(data);
        })
        .catch((err) => {})
        .finally(() => {
          dispatch({
            type: actionTypes.HUB_PROJECT_UPDATE_STATUS_DONE,
          });
        });
    });
  };
}

export function updateProjectData() {
  return (dispatch) => {
    dispatch({
      type: actionTypes.HUB_PROJECT_UPDATE_START,
    });
  };
}

export function getExperiment(experiment_name, commit_id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Project.getExperiment', {
        experiment_name,
        commit_id,
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function getExperimentComponent(experiment_name, commit_id, path) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Project.getExperimentComponent', {
        experiment_name,
        commit_id,
        path,
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function getProjectParams() {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Project.getProjectParams')
        .then((data) => {
          dispatch({
            type: actionTypes.HUB_PROJECT_UPDATE,
            data,
          });
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function getProjectActivity() {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Project.getProjectActivity')
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function downloadModel(experiment_name, model_name) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Project.downloadModel', {
        experiment_name,
        model_name,
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}
