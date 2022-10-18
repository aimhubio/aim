import { StoreApi } from 'zustand';
import produce, { Draft } from 'immer';

export type IEventSystemState = Record<string, any[]>;

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
};

function createState<TStore>(
  store: StoreApi<ExtractState<TStore>>,
  initialState: IEventSystemState,
): any {
  const methods: any = {
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
        '@EVENTS/setEventPayload',
      ),
    /**
     * Function to get the preserved payload of the event
     * @param {string} eventName
     */
    getEventsPayload: (eventName: string) =>
      store.getState()?.events?.payloads?.[eventName] ?? null,
  };

  return {
    initialState,
    ...methods,
  };
}

export { getInitialState };
export default createState;
