import { API_HOST } from 'config/config';

function createAPIRequestWrapper<ResponseDataType>(
  url: string,
  options: RequestInit = {},
  stream?: boolean,
) {
  const controller = new AbortController();
  const signal = controller.signal;

  return {
    call: () =>
      new Promise((resolve: (data: ResponseDataType) => void, reject) => {
        fetch(`${url}`, { ...options, signal })
          .then((response) => (stream ? response.body : response.json()))
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

function getStream<ResponseDataType>(
  url: string,
  params?: {},
  options?: RequestInit,
) {
  return createAPIRequestWrapper<ResponseDataType>(
    `/metric${params ? '?' + new URLSearchParams(params).toString() : ''}`,
    {
      method: 'GET',
      ...options,
    },
    true,
  );
}

function get<ResponseDataType>(
  url: string,
  params?: {},
  options?: RequestInit,
) {
  return createAPIRequestWrapper<ResponseDataType>(
    `${url}${params ? '?' + new URLSearchParams(params).toString() : ''}`,
    {
      method: 'GET',
      ...options,
    },
  );
}

function post<ResponseDataType>(
  url: string,
  data: Body,
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
  getStream,
  post,
  put,
  delete: remove,
};

export default API;
