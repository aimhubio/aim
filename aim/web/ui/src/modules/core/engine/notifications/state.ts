import { StoreApi } from 'zustand';
import produce, { Draft } from 'immer';

import { INotificationItem, INotificationsState } from '../types';

import { ExtractedNotificationsState as ExtractedState } from '.';

function getInitialState(): INotificationsState {
  const initialState: INotificationsState = {
    data: [],
  };
  return initialState;
}

function createState<TStore>(
  store: StoreApi<TStore>,
  initialState: INotificationsState = getInitialState(),
) {
  const selectors = {
    notificationsSelector: (state: ExtractedState<TStore>) =>
      state.notifications.data,
  };

  const methods = {
    removeNotification: (notificationId: string) => {
      store.setState(
        produce<ExtractedState<TStore>>(
          (draft_state: Draft<ExtractedState<TStore>>) => {
            const index = draft_state.notifications.data.findIndex(
              (notification) => notification.id === notificationId,
            );
            if (index !== -1) {
              draft_state.notifications.data.splice(index, 1);
            }
          },
        ),
        false,
        // @ts-ignore
        '@NOTIFICATIONS/REMOVE_NOTIFICATION',
      );
    },
    addNotification: (notification: INotificationItem) => {
      store.setState(
        produce<ExtractedState<TStore>>(
          (draft_state: Draft<ExtractedState<TStore>>) => {
            draft_state.notifications.data.push(notification);
          },
        ),
        false,
        // @ts-ignore
        '@NOTIFICATIONS/ADD_NOTIFICATION',
      );
    },
  };

  return {
    initialState,
    selectors,
    ...methods,
  };
}

export { getInitialState };
export default createState;
