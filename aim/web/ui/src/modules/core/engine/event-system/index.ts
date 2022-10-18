import createState, { getInitialState } from './state';

function createEventSystemEngine(store: any): any {
  const initialState = getInitialState();
  const state = createState(store, initialState);

  let events: any = {};

  /**
   * Function to fire an event
   * @param {string} eventName
   * @param {any} payload
   */
  function fire(eventName: string, payload: any, setPayload: boolean = true) {
    if (events[eventName]) {
      events[eventName].callbacks.forEach((callback: any) =>
        callback(payload, events),
      );
      if (setPayload) {
        state.setEventPayload(eventName, payload);
      }
    }
  }

  /**
   * Function to subscribe to event
   * @param {string} eventName
   * @param {any} callBack
   */
  function on(eventName: string, callBack: any): any {
    if (events[eventName]) {
      events[eventName].callbacks = [...events[eventName].callbacks, callBack];
    } else {
      events[eventName] = { callbacks: [callBack] };
    }
    return callBack;
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

  /**
   * Function to subscribe to event and remove it once it is fired
   * @param {string} eventName
   * @param {any} callBack
   */
  function once(eventName: string, callBack: any) {
    const onceWrapper = () => {
      callBack();
      unsubscribe(eventName, onceWrapper);
    };
    return on(eventName, onceWrapper);
  }

  /**
   * Function to get the listener count of the event
   * @param {string} eventName
   */
  function listenerCount(eventName: string) {
    return events[eventName] ? events[eventName].callbacks.length : 0;
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
      listenerCount,
      getEventsPayload: state.getEventsPayload,
    },
  };
}

export default createEventSystemEngine;
