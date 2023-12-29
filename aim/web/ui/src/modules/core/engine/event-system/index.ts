import _ from 'lodash-es';

import createState, { getInitialState, IEventSystemState } from './state';

type Callback = (payload: any) => void;

export interface IEventSystemEngine {
  state: {
    payloads: IEventSystemState;
  };
  engine: {
    fire: (
      eventName: string,
      payload: any,
      options?: { savePayload: boolean },
    ) => void;
    on: (eventName: string, callback: Callback) => () => void;
    unsubscribe: (eventName: string, callback: Callback) => void;
    once: (
      eventName: string,
      callback: Callback,
    ) => (eventName: string, callback: Callback) => void;
    getListenerCount: (eventName: string) => number;
    removeEventListeners: (eventName: string) => void;
    getEventPayload: (eventName: string) => any;
  };
}

function createEventSystemEngine<TStore>(store: any): IEventSystemEngine {
  const initialState = getInitialState();
  const state = createState<TStore>(store, initialState);

  let events: Record<string, Callback[]> = {};

  /**
   * Function to fire an event
   * @param {string} eventName
   * @param {any} payload
   */
  function fire(
    eventName: string,
    payload: any,
    options: Record<string, any> = { savePayload: true },
  ) {
    if (events[eventName]) {
      events[eventName].forEach((callback: Callback) => callback(payload));
      if (options.savePayload) {
        state.setEventPayload(eventName, payload);
      }
    }
  }

  /**
   * Function to subscribe to event
   * @param {string} eventName
   * @param {Callback} callback
   */
  function on(eventName: string, callback: Callback): () => void {
    if (events[eventName]) {
      events[eventName] = [...events[eventName], callback];
    } else {
      events[eventName] = [callback];
    }
    return () => unsubscribe(eventName, callback);
  }

  /**
   * Function to unsubscribe to event
   * @param {string} eventName
   * @param {Callback} callback
   */
  function unsubscribe(eventName: string, callback: Callback) {
    if (events[eventName]) {
      events[eventName].splice(events[eventName].indexOf(callback) >>> 0, 1);
    }
  }

  /**
   * Function to subscribe to event and remove it once it is fired
   * @param {string} eventName
   * @param {Callback} callback
   */
  function once(
    eventName: string,
    callback: Callback,
  ): (eventName: string, callback: Callback) => void {
    const onceWrapper = () => {
      callback(store.getState()?.events?.payloads?.[eventName] ?? null);
      unsubscribe(eventName, onceWrapper);
    };
    return on(eventName, onceWrapper);
  }

  /**
   * Function to get the listener count of the event
   * @param {string} eventName
   */
  function getListenerCount(eventName: string) {
    return events[eventName] ? events[eventName].length : 0;
  }

  /**
   * Function to get the listener count of the event
   * @param {string} eventName
   */
  function removeEventListeners(eventName: string) {
    events = _.omit(events, eventName);
  }

  return {
    state: {
      payloads: state.initialState,
    },
    engine: {
      fire,
      on,
      unsubscribe,
      once,
      getListenerCount,
      removeEventListeners,
      getEventPayload: state.getEventPayload,
    },
  };
}

export default createEventSystemEngine;
