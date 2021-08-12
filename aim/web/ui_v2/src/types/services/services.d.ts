export interface IApiRequest<T> {
  call: () => Promise<T | any>;
  abort: () => void;
}
