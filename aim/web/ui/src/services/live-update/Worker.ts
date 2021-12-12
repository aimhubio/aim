/**
 * @TODO improve logging, exception handling
 */

/* eslint-disable no-console */

import * as Comlink from 'comlink';

import { setAPIBasePath } from 'config/config';

import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';

import {
  Scheduler,
  ApiMethods,
  ISubscriptions,
  SubscriptionTypes,
  WorkerApiCallResultSubscriber,
} from './types';
import {
  createGetStream,
  createTransferableData,
  invariantError,
  invariantSuccess,
} from './utils';

/*
 * Subscribers collection grouped by subscription type
 * Currently type 'API_CALL_RESULT' is the only subscription type,
 *     but it is possible to add some types here
 */
let subscriptions: ISubscriptions = {
  [SubscriptionTypes.API_CALL_RESULT]: [],
};

/*
 * symbol to identify the worker instance
 * can be useful for logs
 */
let key: Symbol;

// delay
let schedulerDelay: number = 5000;

// api url prefix
let url: string = '';

// scheduler
let schedule: Scheduler = {
  timerId: null,
  inProgress: false,
};

// api methods
let apiMethods: ApiMethods | null = null;

// enable/disable logging
let logging = true;

/**
 * @external function subscribeToApiCallResult
 * When using it from other thread
 *    it is no possible to send callback function using postMessage's parameter
 *    make callback function as a proxy using Comlink.proxy(callback), or implement proxy
 *    making it proxy is a chance to transfer callable native codes between different agents(threads, workers, ...)
 * Useful when other threads, or internal methods have to listen api call's responses
 * @param {WorkerApiCallResultSubscriber} subscriber - callback function to call after some event
 */
function subscribeToApiCallResult(subscriber: WorkerApiCallResultSubscriber) {
  subscriptions[SubscriptionTypes.API_CALL_RESULT].push(subscriber);
}

/**
 * @internal
 * function removeSubscribers
 * Currently this function removes only subscribers grouped by 'API_CALL_RESULT' subscription
 * Can be useful to reset instance of worker,  make use for destroying instance
 * @param {SubscriptionTypes} type - @TODO please refactor function body, if there is need to reset all subscriptions
 */
function removeSubscribers(
  type: SubscriptionTypes = SubscriptionTypes.API_CALL_RESULT,
) {
  subscriptions[type] = [];
}

/**
 * function transferApiCallResponse
 * This function called once api response is ready, and need to send to subscribers
 * @internal usage
 * @param {ArrayLike<unknown>} data - api call response, can be any
 */
function transferApiCallResponse(data: Array<unknown>) {
  if (subscriptions[SubscriptionTypes.API_CALL_RESULT].length) {
    const transferable = createTransferableData(data);
    subscriptions[SubscriptionTypes.API_CALL_RESULT].forEach(
      (subscriber: WorkerApiCallResultSubscriber) => {
        subscriber(
          Comlink.transfer(transferable.buffer, [transferable.buffer]),
        );
      },
    );
  }
}

/**
 * @internal
 * schedule periodic function call
 * @param {(q: string) => Promise<any>} f - callback
 */
function scheduler(f: (q: string) => Promise<any>) {
  // @TODO improve
  //  now this will call every for delay ms, need to create delay after each other

  const timerId = setInterval(f, schedulerDelay);
  schedule = {
    timerId,
    inProgress: false,
  };
}

/**
 * @external function stop
 * stop worker processes
 *    currently there is a single process (api call)
 *    calling stop function will abort the call, and will pause scheduler
 * @return {Promise<any>} - abort promise
 */
async function stop(): Promise<any> {
  try {
    if (apiMethods) {
      await apiMethods.abort();
      if (schedule.timerId) {
        clearTimeout(schedule.timerId);
      }
      schedule = {
        timerId: null,
        inProgress: false,
      };
      apiMethods = null;
    }
    invariantSuccess(`Stopped ${key.toString()} success`, logging);
  } catch (e: Error | any) {
    invariantError(e, logging);
    throw e;
  }
}

/**
 * @external function start
 * @param {Object} params - params to send with http request
 */
function start(params: Object = {}): void {
  apiMethods = createGetStream(url, params);
  invariantSuccess(`Started ${key.toString()} success`, logging);

  scheduler(startUpdateCall);
}

/**
 * @internal
 */
async function startUpdateCall(): Promise<any> {
  // calculate nec-s;
  logging && console.time(`${key.toString()} operated`);

  const stream = await apiMethods?.call();
  let gen = adjustable_reader(stream);
  let buffer_pairs = decode_buffer_pairs(gen);
  let decodedPairs = decodePathsVals(buffer_pairs);
  let objects = iterFoldTree(decodedPairs, 1);

  const data = [];

  for await (let [keys, val] of objects) {
    const d: any = val;
    data.push({ ...d, hash: keys[0] } as any);
  }

  logging && console.timeEnd(`${key.toString()} operated`);
  transferApiCallResponse(data);
}

/**
 * @external function close
 * function close
 * close function is useful for cleanup, when worker has not usage
 * close function will
 *    removes all subscribers
 *    removes internal objects to reduce garbage collector iterations
 *    terminate the worker
 * Alternative is myWorkerInstanceProxy[Comlink.releaseProxy]()
 *      this will detach the proxy and the exposed object from the message channel, allowing both ends to be garbage collected.
 *      Will be useful when there is no need to terminate, just need to remove js proxies to temporarily cleanup the heap
 */
function close() {
  // maybe this is no need, depends on terminated/released
  removeSubscribers();

  // eslint-disable-next-line no-restricted-globals
  self.close();
}

/**
 * @TODO make chance to set config as constructor parameters
 * @external function setConfig
 * function setConfig
 * @param {string} name - the name to unify worker
 * @param {string} endpoint - http call endpoint
 * @param {number} delay - delay (milliseconds)
 * @param {boolean} enableLog - enable/disable logging - default is disabled
 */
const setConfig = (
  name: string,
  endpoint: string,
  delay: number = 5000,
  enableLog = false,
) => {
  key = Symbol(`app.live.update.${name}`);
  logging = enableLog;
  url = endpoint;
  schedulerDelay = delay;
};

export function errorHandler(error: ResponseType) {
  invariantError(error, logging);
}

function replaceBasePath(basePath: string) {
  setAPIBasePath(basePath);
}

const WebWorker = {
  subscribeToApiCallResult,
  setConfig,
  start,
  close,
  stop,
  replaceBasePath,
};

export type IWorker = typeof WebWorker;

// @ts-ignore
Comlink.expose(WebWorker);
