export type IEventSystemState = Record<
  string,
  { eventName: string; callbacks: any[] }
>;

type ExtractState = {
  events: IEventSystemState;
};

function getInitialState(): ExtractState {
  return { events: {} };
}

function createState(): any {
  // let events: any = getInitialState();
  // const methods = {
  //   setEvent: (eventName: string, callBack: any) => {
  //     if (events[eventName]) {
  //       state.events[eventName].callbacks = [
  //         ...state.events[eventName].callbacks,
  //         callBack,
  //       ];
  //     } else {
  //       state.events = {
  //         ...state.events,
  //         [eventName]: {
  //           eventName: eventName,
  //           callbacks: [callBack],
  //         },
  //       };
  //     }
  //   },
  //   removeEvent: (eventName: string, callBack: any) => {
  //     if (state?.events[eventName]) {
  //       state.events[eventName].callbacks = state.events[
  //         eventName
  //       ].callbacks.filter(
  //         (listenerCallback: any) => listenerCallback !== callBack,
  //       );
  //     }
  //   },
  // };

  return {
    // state,
    // methods,
  };
}

export { getInitialState };
export default createState;
