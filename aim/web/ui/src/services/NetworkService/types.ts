export type Interceptor = <T, D>(
  data: T,
  headers?: Record<string, unknown>,
) => D | Promise<D>;

export enum HttpRequestMethods {
  GET = 'GET',
  PUT = 'PUT',
  HEAD = 'HEAD',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTION = 'OPTION',
}

export enum HttpErrorMessages {
  INVALID_REQUEST_PARAMS = 'Invalid request parameters.',
  INVALID_RESPONSE_DATA = 'Invalid Response Data',
  SERVER_IS_UNAVAILABLE = 'The server is unavailable.',
  RESPONSE_PARSING_ERROR = 'Unable to parse response.',
}

export type RequestOptions = {
  method?: HttpRequestMethods;
  query_params?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  body?: string | Record<string, any> | File | ReadableStream<any>;
  signal?: AbortSignal;
};

export interface RequestInit {
  /**
   * A BodyInit object or null to set request's body.
   */
  body?: string | Record<string, unknown> | File | null;

  /**
   * A string indicating how the request will interact with the
   * browser's cache to set request's cache.
   */
  cache?: Record<string, unknown>;

  /**
   * A string indicating whether credentials will be sent with the
   * request always, never, or only when sent to a same-origin URL.
   *
   * Sets request's credentials.
   */
  credentials?: Record<string, unknown>;

  /**
   * A Headers object, an object literal, or an array of two-item
   * arrays to set request's headers.
   */
  headers?: Record<string, unknown>;

  /**
   * A cryptographic hash of the resource to be fetched by request.
   *
   * Sets request's integrity.
   */
  integrity?: string;

  /**
   * A boolean to set request's keepalive.
   */
  keepalive?: boolean;

  /**
   * A string to set request's method.
   */
  method?: string;

  /**
   * A string to indicate whether the request will use CORS, or will be
   * restricted to same-origin URLs. Sets request's mode.
   */
  mode?: Record<string, unknown>;

  /**
   * A string indicating whether request follows redirects, results in an error
   * upon encountering a redirect, or returns the redirect (in an opaque fashion).
   *
   * Sets request's redirect.
   */
  redirect?: Record<string, unknown>;

  /**
   * A string whose value is a same-origin URL, "about:client", or the empty string,
   * to set request's referrer.
   */
  referrer?: string;

  /**
   * A referrer policy to set request's referrerPolicy.
   */
  referrerPolicy?: Record<string, unknown>;

  /**
   * An AbortSignal to set request's signal.
   */
  signal?: AbortSignal | null;
}

export interface HttpResponseBody {
  status: string;
}

export type HttpResponse<T extends HttpResponseBody> = {
  body: T;
  headers: any; // @TODO fill in later
};

export type RequestInstance = {
  call: (...args: any) => Promise<ReadableStream<any>>;
  cancel: () => void;
};
