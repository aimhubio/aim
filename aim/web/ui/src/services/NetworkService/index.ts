import {
  HttpRequestMethods,
  HttpErrorMessages,
  Interceptor,
  RequestOptions,
  RequestInit,
  HttpRequestResult,
} from './types';
import exceptionDetector from './interceptors/exceptionDetector';

class NetworkService {
  private interceptors: Interceptor[] = [exceptionDetector];
  private readonly uri?: string;

  constructor(uri: string, interceptors: Array<Interceptor> = []) {
    if (!uri) {
      throw new Error('The "uri" argument must be a string.');
    }

    if (interceptors.length) {
      interceptors.forEach((interceptor: Interceptor) => {
        if (typeof interceptor !== 'function') {
          throw new Error(`The '${interceptor}' is not a function.`);
        }
        this.interceptors.push(interceptor);
      });
    }

    this.uri = uri;
  }

  makeAPIGetRequest = <T>(url: string, options: RequestOptions = {}): T => {
    options = options || {};
    options.method = HttpRequestMethods.GET;
    return this.makeAPIRequest<T>(url, options);
  };

  makeAPIPostRequest = (url: string, options: RequestOptions = {}) => {
    options.method = HttpRequestMethods.POST;
    return this.makeAPIRequest(url, options);
  };

  makeAPIPutRequest = (urlPrefix: string, options: RequestOptions = {}) => {
    options.method = HttpRequestMethods.PUT;
    return this.makeAPIRequest(urlPrefix, options);
  };

  makeAPIDeleteRequest = (urlPrefix: string, options: RequestOptions = {}) => {
    options.method = HttpRequestMethods.DELETE;
    return this.makeAPIRequest(urlPrefix, options);
  };

  makeAPIPatchRequest = (urlPrefix: string, options: RequestOptions = {}) => {
    options.method = HttpRequestMethods.PATCH;
    return this.makeAPIRequest(urlPrefix, options);
  };

  createUrl = (arg: string): string => {
    if (Array.isArray(arg)) {
      return [this.uri, ...arg].join('/');
    }
    return `${this.uri}/${arg}`;
  };

  createQueryParams = (queryParams: Record<string, unknown>) => {
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

  makeAPIRequest = <T>(
    partUrl: string,
    options: RequestOptions = {},
  ): Promise<HttpRequestResult<T>> => {
    return new Promise((resolve, reject) => {
      let url = this.createUrl(partUrl);

      this.request(url, options)
        .then(async (response: { json?: any; status?: any; headers?: any }) => {
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

          if (response.status > 400) {
            return reject(body);
          }

          return resolve({ body, headers });
        })
        .catch((err: any) => reject(err));
    });
  };

  request = (url: string, options: RequestOptions = {}) => {
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
        headers: options.headers || {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      };

      if (options.headers) {
        fetchOptions.headers = options.headers;
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
}

export default NetworkService;
