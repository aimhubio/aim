import * as actionTypes from '../actionTypes';
import callApi from '../../services/api';

export function getProjectInsight(insight_name) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Project.getProjectInsight', {
        insight_name,
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
