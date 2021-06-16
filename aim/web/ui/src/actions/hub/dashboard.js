import { SERVER_API_HOST } from '../../config';

export function getDashboardsList() {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_API_HOST}/dashboards`)
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

export function createDashboard(reqBody) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_API_HOST}/dashboards`, {
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

export function getDashboard(id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_API_HOST}/dashboards/${id}`)
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

export function updateDashboard(id, name) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_API_HOST}/dashboards/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
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

export function removeDashboard(id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${SERVER_API_HOST}/dashboards/${id}`, {
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
