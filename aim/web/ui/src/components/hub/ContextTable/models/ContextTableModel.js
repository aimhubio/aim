// Events

const events = {
  SET_GROUPED_COLUMNS: 'SET_GROUPED_COLUMNS',
};

// Event emitter

const subscriptions = {};

function subscribe(event, fn) {
  const multipleEvents = Array.isArray(event);
  if (multipleEvents) {
    event.forEach((evt) => {
      (subscriptions[evt] || (subscriptions[evt] = [])).push(fn);
    });
  } else {
    (subscriptions[event] || (subscriptions[event] = [])).push(fn);
  }

  return {
    unsubscribe: () => {
      if (multipleEvents) {
        event.forEach((evt) => {
          subscriptions[evt] &&
            subscriptions[evt].splice(subscriptions[evt].indexOf(fn) >>> 0, 1);
        });
      } else {
        subscriptions[event] &&
          subscriptions[event].splice(
            subscriptions[event].indexOf(fn) >>> 0,
            1,
          );
      }
    },
  };
}

function emit(event, data) {
  (subscriptions[event] || []).forEach((fn) => fn(data));
}

export const ContextTableModel = {
  events,
  subscribe,
  emit,
};
