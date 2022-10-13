import _ from 'lodash-es';

// import createState, { getInitialState } from './state';

function createEventSystemEngine(): any {
  // const { state, methods } = createState();
  let events: any = {};

  /**
   * Function to fire an event
   * @param {string} eventName
   * @param {any} payload
   */
  function fire(eventName: string, payload: any) {
    if (events?.[eventName]) {
      events[eventName].callbacks.forEach((callback: any) =>
        callback(payload, events),
      );
    }
  }

  /**
   * Function to subscribe to event
   * @param {string} eventName
   * @param {any} callBack
   */
  function on(eventName: string, callBack: any) {
    if (events[eventName]) {
      events[eventName].callbacks = [...events[eventName].callbacks, callBack];
    } else {
      events[eventName] = { callbacks: [callBack] };
    }
  }

  /**
   * Function to unsubscribe to event
   * @param {string} eventName
   * @param {any} callBack
   */
  function unsubscribe(eventName: string, callBack: any) {
    if (events[eventName]) {
      events[eventName].callbacks = events[eventName].callbacks.filter(
        (listenerCallback: any) => listenerCallback !== callBack,
      );
    }
  }

  return {
    engine: {
      fire,
      on,
      unsubscribe,
    },
  };
}

export default createEventSystemEngine;
