import Cookies from 'js-cookie';

import ENDPOINTS from '../api/endpoints';
import { AuthToken } from '../api/api';

import {
  HttpRequestMethods,
  HttpErrorMessages,
  Interceptor,
  RequestOptions,
  RequestInit,
} from './types';
import exceptionDetector from './interceptors/exceptionDetector';
// remove comment for this line once different platforms will have usage of fetch
// import 'isomorphic-fetch';

/**
 * class NetworkService
 * @Usage
 *   const api = new NetworkService('host/api', [(body, headers) => { body.data = {}; return {body, headers} }]);
 *   api.makeApiGetRequest('resource/:resourceId')
 *     .then({ body, headers } => {
 *        // body.data always will be {}, because passed interceptor which resets the data property of body
 *     })
 * @TODO write methods docs
 */
class NetworkService {
  private interceptors: Interceptor[] = [exceptionDetector];
  private readonly uri?: string;
  private readonly AUTH_TOKEN_KEY = 'Auth';
  private readonly AUTH_REFRESH_TOKEN_KEY = 'token';
  private readonly CONTENT_TYPE = {
    JSON: 'application/json',
    FORM_DATA: 'application/x-www-form-urlencoded',
  };

  constructor(uri: string, interceptors: Array<Interceptor> = []) {
    if (!uri) {
      throw new Error('The "uri" argument must be a string.');
    }

    if (interceptors.length) {
      interceptors.forEach((interceptor: Interceptor) => {
        this.setInterceptor(interceptor);
      });
    }

    this.uri = uri;
  }

  public makeAPIGetRequest = (
    url: string,
    options: RequestOptions = {},
    apiHost: string | undefined = this.uri,
  ) => {
    options = options || {};
    options.method = HttpRequestMethods.GET;
    return this.makeAPIRequest(url, options, apiHost);
  };

  public makeAPIPostRequest = (
    url: string,
    options: RequestOptions = {},
    apiHost: string | undefined = this.uri,
  ) => {
    options.method = HttpRequestMethods.POST;
    return this.makeAPIRequest(url, options, apiHost);
  };

  public makeAPIPutRequest = (
    urlPrefix: string,
    options: RequestOptions = {},
    apiHost: string | undefined = this.uri,
  ) => {
    options.method = HttpRequestMethods.PUT;
    return this.makeAPIRequest(urlPrefix, options, apiHost);
  };

  public makeAPIDeleteRequest = (
    urlPrefix: string,
    options: RequestOptions = {},
    apiHost: string | undefined = this.uri,
  ) => {
    options.method = HttpRequestMethods.DELETE;
    return this.makeAPIRequest(urlPrefix, options, apiHost);
  };

  public makeAPIPatchRequest = (
    urlPrefix: string,
    options: RequestOptions = {},
    apiHost: string | undefined = this.uri,
  ) => {
    options.method = HttpRequestMethods.PATCH;
    return this.makeAPIRequest(urlPrefix, options, apiHost);
  };

  public createUrl = (
    arg: string | Array<string>,
    apiHost: string | undefined = this.uri,
  ): string => {
    if (Array.isArray(arg)) {
      return [apiHost, ...arg].join('/');
    }
    if (arg) {
      return `${apiHost}/${arg}`;
    }
    return `${apiHost}`;
  };

  private createQueryParams = (queryParams: Record<string, unknown>) => {
    return Object.keys(queryParams)
      .reduce((accumulator: Array<string>, key: string) => {
        const item = queryParams[key];
        if (item === null || item === undefined) return accumulator;

        if (Array.isArray(item)) {
          for (let index = 0; index < item.length; index++) {
            const arrItem = item[index];
            accumulator.push(`${key}=${arrItem}`);
          }
        } else {
          accumulator.push(`${key}=${item}`);
        }

        return accumulator;
      }, [])
      .join('&');
  };

  public makeAPIRequest = (
    partUrl: string,
    options: RequestOptions = {},
    apiHost: string | undefined = this.uri,
  ): Promise<{ body: any; headers: any }> => {
    return new Promise((resolve, reject) => {
      let url = this.createUrl(partUrl, apiHost);

      this.request(url, options)
        .then(async (response: Response) => {
          if (!response) {
            return reject({
              message: HttpErrorMessages.INVALID_RESPONSE_DATA,
            });
          }

          const { headers } = response;
          let body: { status?: number } = {};

          const contentType = headers.get('content-type');

          // @ts-ignore
          body = response.body;

          if (contentType && contentType.indexOf('application/json') !== -1) {
            body = await response.json();
          }

          try {
            if (this.interceptors.length) {
              this.interceptors.forEach((interceptor) => {
                if (typeof interceptor === 'function') {
                  // @ts-ignore
                  body = interceptor(body, headers);
                }
              });
            }
          } catch (e: any) {
            reject({ message: e.message, res: { body, headers } });
          }

          if (response.status >= 400) {
            return await this.checkCredentials(response, url, () =>
              this.request(url, options),
            );
          }

          return resolve({ body, headers });
        })
        .catch((err: any) => reject(err));
    });
  };

  private request = (url: string, options: RequestOptions = {}) => {
    return new Promise<any>((resolve, reject) => {
      if (!url) {
        return reject(HttpErrorMessages.INVALID_REQUEST_PARAMS);
      }

      if (options.query_params) {
        const queryParams = this.createQueryParams(options.query_params);

        if (queryParams) {
          const paramGlue = url.includes('?') ? '&' : '?';
          url += `${paramGlue}${queryParams}`;
        }
      }

      if (!options.method) {
        options.method = HttpRequestMethods.GET;
      }

      const fetchOptions: RequestInit = {
        method: options.method,
        headers: options.headers || this.getRequestHeaders(),
      };

      if (options.credentials) {
        fetchOptions.credentials = options.credentials;
      }

      if (options.headers) {
        fetchOptions.headers = options.headers;
      }

      if (options.signal) {
        fetchOptions.signal = options.signal;
      }

      try {
        if (options.body) {
          if (options.body instanceof File) {
            fetchOptions.body = options.body;
          } else {
            fetchOptions.body = JSON.stringify(options.body);
          }
        }
      } catch (ex) {
        return reject({
          message: HttpErrorMessages.INVALID_REQUEST_PARAMS,
        });
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fetch(url, fetchOptions)
        .then((response) => resolve(response))
        .catch((error) => reject(error));
    });
  };

  public setInterceptor(interceptor: Interceptor) {
    if (typeof interceptor !== 'function') {
      throw new Error(`The '${interceptor}' is not a function.`);
    }
    this.interceptors.push(interceptor);
  }

  /**
   * getTimezoneOffset is a function that returns the timezone offset
   * @returns string
   * @example
   * const timezoneOffset = getTimezoneOffset();
   */
  public getTimezoneOffset(): string {
    return `${new Date().getTimezoneOffset()}`;
  }

  /**
   * getAuthToken - Gets the token from local storage
   * @returns {string} - The token
   */
  public getAuthToken(): string {
    return localStorage.getItem(this.AUTH_TOKEN_KEY) || '';
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
  public getRequestHeaders(headers = {}) {
    const requestHeaders: Record<string, string> = {
      'X-Timezone-Offset': this.getTimezoneOffset(),
      'Content-Type': this.CONTENT_TYPE.JSON,
      ...headers,
    };

    const Authorization = this.getAuthToken();
    if (Authorization) {
      requestHeaders.Authorization = Authorization;
    }
    return requestHeaders;
  }

  /**
   * refreshToken is a function that makes a GET request to the auth endpoint for refresh the token
   * @returns IResponse<AuthToken>
   * @throws Error
   */
  public async refreshToken() {
    return this.makeAPIGetRequest(
      `${ENDPOINTS.AUTH.BASE}/${ENDPOINTS.AUTH.REFRESH}`,
      {
        headers: this.getRequestHeaders(),
        credentials:
          process.env.NODE_ENV === 'development' ? 'include' : 'same-origin',
      },
      `${window.location.origin}/api`,
    );
  }

  /**
   * removeAuthToken - Removes the token from local storage and refresh token from cookies
   * @returns {void}
   */
  public removeAuthToken(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    this.removeRefreshToken();
  }

  /**
   * setAuthToken - Sets the token in local storage and refresh token in cookies
   * @param {AuthToken} token - The token object
   * @returns {void}
   */
  public setAuthToken({
    token_type,
    refresh_token,
    access_token,
  }: AuthToken): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, `${token_type} ${access_token}`);
    this.setRefreshToken(refresh_token);
  }

  /**
   * setRefreshToken - Sets the refresh token in cookies
   * @param refresh_token - The refresh token
   * @returns {void}
   */
  public setRefreshToken(refresh_token: string): void {
    Cookies.set(this.AUTH_REFRESH_TOKEN_KEY, refresh_token);
  }

  /**
   * removeRefreshToken - Removes the refresh token from cookies
   * @returns {void}
   */
  public removeRefreshToken(): void {
    Cookies.remove(this.AUTH_REFRESH_TOKEN_KEY);
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
  public async parseResponse<T>(response: Response): Promise<T> {
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

  public async checkCredentials<T>(
    response: Response,
    endpoint: string,
    refetch: () => Promise<T>,
  ): Promise<T> {
    if (response.status === 401) {
      if (endpoint === `${ENDPOINTS.AUTH.BASE}/${ENDPOINTS.AUTH.REFRESH}`) {
        this.removeAuthToken();
        return this.parseResponse<T>(response);
      }
      // Refresh token
      const token = (await this.refreshToken()).body;
      if (token) {
        this.setAuthToken(token);
        return refetch();
      }
    }
    return this.parseResponse<T>(response);
  }
}

export * from './types';
export default NetworkService;
