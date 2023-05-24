export interface IApiRequest<T> {
  call: (detail?: any) => Promise<T | any>;
  abort: () => void;
}

export interface IApiRequestRef<T> {
  call: (exceptionHandler: (detail: any) => void) => Promise<T | any>;
  abort: () => void;
}
