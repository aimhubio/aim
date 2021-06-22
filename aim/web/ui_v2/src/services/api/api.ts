import { API_HOST } from 'config/config';

function createAPIRequestWrapper(url: string, options?: RequestInit) {
  const controller = new AbortController();
  const signal = controller.signal;

  return {
    call: () =>
      new Promise((resolve, reject) => {
        fetch(`${API_HOST}/${url}`, { ...options, signal })
          .then((response) => response.json())
          .then((data) => resolve(data))
          .catch((err) => {
            if (err.name === 'AbortError') {
              // Fetch aborted
            } else {
              reject(err);
            }
          });
      }),
    abort: () => controller.abort(),
  };
}

function get(url: string, options?: RequestInit) {
  return createAPIRequestWrapper(url, {
    method: 'GET',
    ...options,
  });
}

function post(url: string, data: Body, options?: RequestInit) {
  return createAPIRequestWrapper(url, {
    method: 'POST',
    ...options,
    body: JSON.stringify(data),
  });
}

function put(url: string, data: Body, options?: RequestInit) {
  return createAPIRequestWrapper(url, {
    method: 'PUT',
    ...options,
    body: JSON.stringify(data),
  });
}

function remove(url: string, data: Body, options?: RequestInit) {
  return createAPIRequestWrapper(url, {
    method: 'DELETE',
    ...options,
  });
}

const API = {
  get,
  post,
  put,
  delete: remove,
};

export default API;
