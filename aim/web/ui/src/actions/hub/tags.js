import * as actionTypes from '../actionTypes';
import callApi from '../../services/api';

export function getTags() {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Tag.getTags')
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function getTag(tag_id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Tag.getTag', { tag_id })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function postNewTag(params) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Tag.postNewTag', { ...params })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function updateTag(params) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Tag.updateTag', { ...params })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function getRelatedRuns(tag_id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Tag.getRelatedRuns', { tag_id })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}
