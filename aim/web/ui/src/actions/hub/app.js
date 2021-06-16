import { SERVER_API_HOST } from '../../config';

export function getAppsList() {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_API_HOST}/apps`)
        .then((res) => res.json())
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function createApp(reqBody) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_API_HOST}/apps`, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      })
        .then((res) => res.json())
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function getApp(id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_API_HOST}/apps/${id}`)
        .then((res) => res.json())
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function updateApp(id, reqBody) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_API_HOST}/apps/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reqBody),
      })
        .then((res) => res.json())
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function removeApp(id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_API_HOST}/apps/${id}`, {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}
