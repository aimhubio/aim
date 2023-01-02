import _ from 'lodash-es';

import { throttle } from 'components/Table/utils';

import { createBlobsRequest } from 'modules/core/api/runsApi';

import { SequenceTypesEnum } from 'types/core/enums';

import { parseStream } from 'utils/encoder/streamEncoding';
import arrayBufferToBase64 from 'utils/arrayBufferToBase64';

type Callback = (blobData: string) => void;

export interface IBlobURISystemEngine {
  engine: {
    fire: (blobUri: string, blobData: any) => void;
    on: (blobUri: string, callback: Callback) => () => void;
    unsubscribe: (blobUri: string, callback: Callback) => void;
    getBlobData: (blobUri: string) => string | null;
    addUriToQueue: (blobUri: string) => void;
    getBlobsData: (uris: string[]) => any;
  };
}

const BATCH_SEND_DELAY = 1000;

function createBlobURISystemEngine(
  sequenceType: SequenceTypesEnum,
): IBlobURISystemEngine {
  const blobsData: Record<string, string> = {};
  const blobsSubscriptions: Record<string, Callback[]> = {};
  let blobUriQueue: string[] = [];
  let timeoutID: number | null = null;

  const request = createBlobsRequest(sequenceType);

  /**
   * Function to fire an event
   * @param {string} blobUri
   * @param {string} blobData
   */
  function fire(blobUri: string, blobData: string) {
    blobsData[blobUri] = blobData;
    if (blobsSubscriptions[blobUri]) {
      blobsSubscriptions[blobUri].forEach((callback: Callback) =>
        callback(blobData),
      );
    }
  }

  /**
   * Function to subscribe to event
   * @param {string} blobUri
   * @param {Callback} callback
   */
  function on(blobUri: string, callback: Callback): () => void {
    if (blobsSubscriptions[blobUri]) {
      blobsSubscriptions[blobUri] = [...blobsSubscriptions[blobUri], callback];
    } else {
      blobsSubscriptions[blobUri] = [callback];
    }
    return () => unsubscribe(blobUri, callback);
  }

  /**
   * Function to unsubscribe to event
   * @param {string} blobUri
   * @param {Callback} callback
   */
  function unsubscribe(blobUri: string, callback: Callback) {
    if (blobsSubscriptions[blobUri]) {
      blobsSubscriptions[blobUri].splice(
        blobsSubscriptions[blobUri].indexOf(callback) >>> 0,
        1,
      );
    }
  }

  /**
   * Function to get the blob data
   * @param {string} blobUri
   */
  function getBlobData(blobUri: string) {
    return blobsData[blobUri] ?? null;
  }

  /**
   * Function to add URI to queue
   * @param {string} blobUri
   */
  function addUriToQueue(blobUri: string) {
    blobUriQueue.push(blobUri);
    if (!blobsData[blobUri]) {
      blobUriQueue.push(blobUri);
      getBatch();
    }
  }

  /**
   * Function to throttle the batch get request
   */
  const getBatch = throttle(() => {
    if (timeoutID) {
      window.clearTimeout(timeoutID);
    }
    timeoutID = window.setTimeout(() => {
      if (!_.isEmpty(blobUriQueue)) {
        getBlobsData(blobUriQueue)
          .call()
          .then(() => {
            blobUriQueue = [];
          });
      }
    }, BATCH_SEND_DELAY);
  }, BATCH_SEND_DELAY);

  /**
   * Function to throttle the batch get request
   * @param {Array} blobUris
   */
  function getBlobsData(blobUris: string[]) {
    return {
      abort: request.cancel,
      call: () => {
        return request
          .call(blobUris)
          .then(async (stream) => {
            parseStream(stream, {
              callback: (object: { hash: string; value: ArrayBuffer }) => {
                const blobData: string = arrayBufferToBase64(object.value);
                fire(object.hash, blobData);
              },
            });
            return Promise.resolve();
          })
          .catch((ex) => {
            if (ex.name === 'AbortError') {
              // Abort Error
            } else {
              // eslint-disable-next-line no-console
              console.log('Unhandled error: ', ex);
            }
          });
      },
    };
  }

  return {
    engine: {
      fire,
      on,
      unsubscribe,
      getBlobData,
      addUriToQueue,
      getBlobsData,
    },
  };
}

export default createBlobURISystemEngine;
