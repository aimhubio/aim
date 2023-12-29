import { getAPIHost } from 'config/config';

const AUTH_TOKEN_KEY = 'Auth';

export const CONTENT_TYPE = {
  JSON: 'application/json',
  FORM_DATA: 'application/x-www-form-urlencoded',
};

function createAPIRequestWrapper<ResponseDataType>(
  url: string,
  options: RequestInit = {},
  stream?: boolean,
) {
  const controller = new AbortController();
  const signal = controller.signal;

  return {
    call: (exceptionHandler?: (error: ResponseDataType) => any) =>
      new Promise((resolve: (data: ResponseDataType) => void, reject) => {
        fetch(`${getAPIHost()}/${url}`, { ...options, signal })
          .then(async (response) => {
            try {
              if (response.status >= 400) {
                const body = await response.json();

                if (typeof exceptionHandler === 'function') {
                  exceptionHandler(body);
                }

                // return reject(body.detail); @TODO delete comment, after handling
                return;
              }
              const data = stream ? response.body : await response.json();

              resolve(data);
            } catch (err: Error | any) {
              if (typeof exceptionHandler === 'function') {
                exceptionHandler(err);
              }
              reject(err);
            }
          })
          .catch((err: Error | any) => {
            if (err.name === 'AbortError') {
              // Fetch aborted
            } else {
              if (typeof exceptionHandler === 'function') {
                exceptionHandler(err);
              }
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
    `${url}${
      options?.method === 'POST'
        ? ''
        : params
        ? '?' + new URLSearchParams(params).toString()
        : ''
    }`,
    {
      method: 'GET',
      ...options,
      headers: getRequestHeaders(),
      ...(options?.method === 'POST' && {
        body: JSON.stringify(params),
      }),
    },
    true,
  );
}

function getStream1<ResponseDataType>(
  url: string,
  params?: {},
  options?: RequestInit,
) {
  return createAPIRequestWrapper<ResponseDataType>(
    `${url}${
      options?.method === 'POST' && params
        ? '?' + new URLSearchParams(params).toString()
        : ''
    }`,
    {
      method: 'GET',
      ...options,
      headers: getRequestHeaders(),
      ...(options?.method === 'POST' && {
        body: JSON.stringify(options.body),
      }),
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
      headers: getRequestHeaders(),
    },
  );
}

function post<ResponseDataType>(
  url: string,
  data: object,
  options?: RequestInit,
) {
  return createAPIRequestWrapper<ResponseDataType>(url, {
    method: 'POST',
    ...options,
    headers: getRequestHeaders(),
    body: JSON.stringify(data),
  });
}

function put<ResponseDataType>(
  url: string,
  data: object,
  options?: RequestInit,
) {
  return createAPIRequestWrapper<ResponseDataType>(url, {
    method: 'PUT',
    ...options,
    headers: getRequestHeaders(),
    body: JSON.stringify(data),
  });
}

function remove<ResponseDataType>(url: string, options?: RequestInit) {
  return createAPIRequestWrapper<ResponseDataType>(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * getTimezoneOffset is a function that returns the timezone offset
 * @returns string
 * @example
 * const timezoneOffset = getTimezoneOffset();
 */
function getTimezoneOffset(): string {
  return `${new Date().getTimezoneOffset()}`;
}

/**
 * getRequestHeaders is a function that returns the request headers
 * @returns object
 * @example
 * const requestHeaders = getRequestHeaders();
 * const response = await fetch(`${API_ROOT}${endpoint}`, {
 *  method: "POST",
 *  headers: requestHeaders,
 *  body: JSON.stringify(data),
 * });
 */
function getRequestHeaders(headers = {}) {
  const requestHeaders: Record<string, string> = {
    'X-Timezone-Offset': getTimezoneOffset(),
    'Content-Type': CONTENT_TYPE.JSON,
    Authorization: getAuthToken(),
    ...headers,
  };
  return requestHeaders;
}

/**
 * getAuthToken - Gets the token from local storage
 * @returns {string} - The token
 */
function getAuthToken(): string {
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

const API = {
  get,
  getStream,
  getStream1,
  post,
  put,
  delete: remove,
};

export default API;
