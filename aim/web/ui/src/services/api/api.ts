import Cookies from 'js-cookie';

import { getAPIHost } from 'config/config';

import ENDPOINTS from './endpoints';

export interface AuthToken {
  /**
   * @description access_token is the token of the user
   * @example "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9"
   */
  access_token: string;
  /**
   * @description token_type is the type of the token
   * @example "bearer"
   */
  token_type: string;
  /**
   * @description refresh_token is the refresh token of the user
   * @example 3600
   */
  refresh_token: string;
}

const AUTH_TOKEN_KEY = 'Auth';
const AUTH_REFRESH_TOKEN_KEY = 'token';

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

                return await checkCredentials<ResponseDataType>(
                  response,
                  url,
                  () =>
                    createAPIRequestWrapper<ResponseDataType>(
                      url,
                      options,
                      stream,
                    ).call(exceptionHandler),
                );
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
    headers: getRequestHeaders(),
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
    ...headers,
  };
  const Authorization = getAuthToken();
  if (Authorization) {
    requestHeaders.Authorization = Authorization;
  }
  return requestHeaders;
}

/**
 * getAuthToken - Gets the token from local storage
 * @returns {string} - The token
 */
function getAuthToken(): string {
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

/**
 * removeAuthToken - Removes the token from local storage and refresh token from cookies
 * @returns {void}
 */
function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  removeRefreshToken();
}

/**
 * setAuthToken - Sets the token in local storage and refresh token in cookies
 * @param {AuthToken} token - The token object
 * @returns {void}
 */
function setAuthToken({
  token_type,
  refresh_token,
  access_token,
}: AuthToken): void {
  localStorage.setItem(AUTH_TOKEN_KEY, `${token_type} ${access_token}`);
  setRefreshToken(refresh_token);
}

/**
 * setRefreshToken - Sets the refresh token in cookies
 * @param refresh_token - The refresh token
 * @returns {void}
 */
function setRefreshToken(refresh_token: string): void {
  Cookies.set(AUTH_REFRESH_TOKEN_KEY, refresh_token);
}

/**
 * removeRefreshToken - Removes the refresh token from cookies
 * @returns {void}
 */
function removeRefreshToken(): void {
  Cookies.remove(AUTH_REFRESH_TOKEN_KEY);
}

/**
 * refreshToken is a function that makes a GET request to the auth endpoint for refresh the token
 * @returns IResponse<AuthToken>
 * @throws Error
 */
async function refreshToken() {
  const response = await fetch(
    `${window.location.origin}/api/${ENDPOINTS.AUTH.BASE}/${ENDPOINTS.AUTH.REFRESH}`,
    {
      headers: getRequestHeaders(),
      credentials:
        process.env.NODE_ENV === 'development' ? 'include' : 'same-origin',
    },
  );
  return parseResponse<AuthToken>(response);
}

/**
 * parseResponse is a generic function that parses the response body
 * @param response is the response object
 * @returns <T>
 * @throws Error
 * @example
 * const response = await fetch(`${API_ROOT}${endpoint}`);
 * return parseResponse<T>(response);
 */
async function parseResponse<T>(response: Response): Promise<T> {
  try {
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      return Promise.reject(new Error(data.message));
    }
  } catch (error) {
    throw error;
  }
}

async function checkCredentials<T>(
  response: Response,
  endpoint: string,
  refetch: () => Promise<T>,
): Promise<T> {
  if (response.status === 401) {
    if (endpoint === `${ENDPOINTS.AUTH.BASE}/${ENDPOINTS.AUTH.REFRESH}`) {
      removeAuthToken();
      return parseResponse<T>(response);
    }
    // Refresh token
    const token = await refreshToken();
    if (token) {
      setAuthToken(token);
      return refetch();
    }
  }
  return parseResponse<T>(response);
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
