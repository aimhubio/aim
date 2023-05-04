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

  public makeAPIGetRequest = (url: string, options: RequestOptions = {}) => {
    options = options || {};
    options.method = HttpRequestMethods.GET;
    return this.makeAPIRequest(url, options);
  };

  public makeAPIPostRequest = (url: string, options: RequestOptions = {}) => {
    options.method = HttpRequestMethods.POST;
    return this.makeAPIRequest(url, options);
  };

  public makeAPIPutRequest = (
    urlPrefix: string,
    options: RequestOptions = {},
  ) => {
    options.method = HttpRequestMethods.PUT;
    return this.makeAPIRequest(urlPrefix, options);
  };

  public makeAPIDeleteRequest = (
    urlPrefix: string,
    options: RequestOptions = {},
  ) => {
    options.method = HttpRequestMethods.DELETE;
    return this.makeAPIRequest(urlPrefix, options);
  };

  public makeAPIPatchRequest = (
    urlPrefix: string,
    options: RequestOptions = {},
  ) => {
    options.method = HttpRequestMethods.PATCH;
    return this.makeAPIRequest(urlPrefix, options);
  };

  public createUrl = (arg: string | Array<string>): string => {
    if (Array.isArray(arg)) {
      return [this.uri, ...arg].join('/');
    }
    if (arg) {
      return `${this.uri}/${arg}`;
    }
    return `${this.uri}`;
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
  ): Promise<{ body: any; headers: any }> => {
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

          if (response.status >= 400) {
            return reject(body);
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

  private getTimezoneOffset = (): string => {
    return `${new Date().getTimezoneOffset()}`;
  };

  public getRequestHeaders = () => {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Timezone-Offset': this.getTimezoneOffset(),
    };
  };
}

export * from './types';
export default NetworkService;
