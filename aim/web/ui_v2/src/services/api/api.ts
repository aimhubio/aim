import { API_HOST } from 'config/config';

function createAPIRequestWrapper<ResponseDataType>(
  url: string,
  options: RequestInit = {},
) {
  const controller = new AbortController();
  const signal = controller.signal;

  return {
    call: () =>
      new Promise((resolve: (data: ResponseDataType) => void, reject) => {
        fetch(`${API_HOST}/${url}`, { ...options, signal })
          .then((response) => response.json())
          .then((data: ResponseDataType) => resolve(data))
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

function get<ResponseDataType>(url: string, options?: RequestInit) {
  return createAPIRequestWrapper<ResponseDataType>(url, {
    method: 'GET',
    ...options,
  });
}

function post<ResponseDataType>(
  url: string,
  data: object,
  options?: RequestInit,
) {
  return createAPIRequestWrapper<ResponseDataType>(url, {
    method: 'POST',
    ...options,
    body: JSON.stringify(data),
  });
}

function put<ResponseDataType>(url: string, data: Body, options?: RequestInit) {
  return createAPIRequestWrapper<ResponseDataType>(url, {
    method: 'PUT',
    ...options,
    body: JSON.stringify(data),
  });
}

function remove<ResponseDataType>(url: string, options?: RequestInit) {
  return createAPIRequestWrapper<ResponseDataType>(url, {
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
