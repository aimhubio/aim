export enum SubscriptionTypes {
  API_CALL_RESULT = 'API_CALL_RESULT',
}

export type ExceptionHandler = (error: ResponseType) => void;

export type ApiMethods = {
  call: (exceptionHandler?: ExceptionHandler) => Promise<any>;
  abort: () => void;
};

export type Scheduler = {
  timerId: null | number;
  inProgress: boolean;
};

export type WorkerApiCallResultSubscriber = (data: ArrayBufferLike) => void;

export interface IScheduler {
  timerId: number | null;
  inProgress: boolean;
}

export interface ApiRequestParams {
  query: string;
  limit: number;
}

export interface ISubscriptions {
  [SubscriptionTypes.API_CALL_RESULT]: WorkerApiCallResultSubscriber[];
}
