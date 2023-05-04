import { StoreApi } from 'zustand';
import produce, { Draft } from 'immer';

export type IEventSystemState = Record<string, any>;

type ExtractState<TStore> = {
  events: {
    payloads: IEventSystemState;
  };
} & TStore;

function getInitialState(): IEventSystemState {
  return {};
}

export type EventsStateBridge = {
  initialState: IEventSystemState;
} & EventSystemMethods;

export type EventSystemMethods = {
  setEventPayload: (eventName: string, payload: any) => void;
  getEventPayload: (eventName: string) => any;
};

function createState<TStore>(
  store: StoreApi<ExtractState<TStore>>,
  initialState: IEventSystemState,
): {
  initialState: IEventSystemState;
} & EventSystemMethods {
  const methods: EventSystemMethods = {
    /**
     * Function to  preserved payload of the event
     * @param {string} eventName
     * @param {any} payload
     */
    setEventPayload: (eventName: string, payload: any) =>
      store.setState(
        produce((draft_state: Draft<ExtractState<TStore>>) => {
          draft_state.events.payloads[eventName] = payload;
        }),
        false,
        // @ts-ignore
        `@EVENTS/set_${eventName}_Payload`,
      ),
    /**
     * Function to get the preserved payload of the event
     * @param {string} eventName
     */
    getEventPayload: (eventName: string) =>
      store.getState()?.events?.payloads?.[eventName] ?? null,
  };

  return {
    initialState,
    ...methods,
  };
}

export { getInitialState };
export default createState;
