export interface IApiRequest<T> {
  call: (detail?: any) => Promise<T | any>;
  abort: () => void;
}
