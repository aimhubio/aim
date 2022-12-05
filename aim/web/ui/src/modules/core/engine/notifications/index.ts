import _ from 'lodash-es';

import { ExtractState, INotificationItem, INotificationsState } from '../types';

import createState, { getInitialState } from './state';

interface INotificationMethodNotifyArgs {
  title?: string;
  messages?: string[] | string;
  style?: {};
  iconName?: string;
  duration?: number;
}

export interface INotificationsEngine<TStore = object> {
  state: INotificationsSlice;
  engine: {
    addNotification: (notificationItem: INotificationItem) => void;
    removeNotification: (id: string) => void;
    notify: ({
      title,
      messages,
      style,
      iconName,
      duration,
    }: INotificationMethodNotifyArgs) => void;
    warning: (
      messages?: INotificationItem['messages'],
      duration?: INotificationItem['duration'],
    ) => void;
    success: (
      messages?: INotificationItem['messages'],
      duration?: INotificationItem['duration'],
    ) => void;
    error: (
      messages?: INotificationItem['messages'],
      duration?: INotificationItem['duration'],
    ) => void;
    info: (
      messages?: INotificationItem['messages'],
      duration?: INotificationItem['duration'],
    ) => void;
    notificationsSelector: (
      state: ExtractedNotificationsState<TStore>,
    ) => INotificationsState['data'];
  };
}

export interface INotificationsSlice {
  notifications: INotificationsState;
}

export type ExtractedNotificationsState<T> = ExtractState<
  T,
  INotificationsSlice
>;

/**
 * 'NOTIFICATION_DURATION' is the default duration time for displaying the notification
 */
const NOTIFICATION_DURATION = 3000;

function createNotificationsEngine<TStore>(store: any) {
  const initialState = getInitialState();
  const state = createState<TStore>(store, initialState);

  /**
   * 'addTemporaryNotification' function is for adding the notification, after the duration time, it will be removed
   *
   * @param notificationItem - notification item
   * @param duration - duration of the notification
   */
  const addTemporaryNotification = (
    notificationItem: INotificationItem,
    duration: number = NOTIFICATION_DURATION,
  ): void => {
    if (notificationItem.id) {
      state.addNotification(notificationItem);

      window.setTimeout(() => {
        state.removeNotification(notificationItem.id);
      }, duration);
    }
  };

  /**
   * 'notify' function is for generating custom notifications or rest of notification methods (warning, error, success, info)
   *
   * @param notificationItem - notification item
   */
  const notify = ({
    title = 'Notification',
    messages = 'Notification message',
    style = {},
    iconName = '',
    duration = NOTIFICATION_DURATION,
  }: INotificationMethodNotifyArgs): void => {
    addTemporaryNotification(
      {
        id: Date.now().toString(),
        title,
        messages: Array.isArray(messages) ? messages : [messages],
        style,
        iconName,
      },
      duration,
    );
  };

  /**
   * 'warning' function is for notifying an action including some warning information, with predefined 'warning' color, icon and title
   *
   * @param messages {string[] | string} - notification messages array or single message
   * @param duration {number} - duration of the notification
   */
  const warning = (
    messages: string[] | string = 'Warning message',
    duration: number = NOTIFICATION_DURATION,
  ): void => {
    notify({
      title: 'Warning',
      style: { borderColor: '#ff9800' },
      iconName: 'warning',
      messages,
      duration,
    });
  };

  /**
   * 'success' function is for notifying an action including some success information, with predefined 'success' color, icon and title
   *
   * @param messages {string[] | string} - notification messages array or single message
   * @param duration {number} - duration of the notification
   */
  const success = (
    messages: string[] | string = 'Success message',
    duration: number = NOTIFICATION_DURATION,
  ): void => {
    notify({
      title: 'Success',
      style: { borderColor: '#4caf50' },
      iconName: 'success',
      messages,
      duration,
    });
  };

  /**
   * 'error' function is for notifying an action including some error information, with predefined 'error' color, icon and title
   *
   * @param messages {string[] | string} - notification messages array or single message
   * @param duration {number} - duration of the notification
   */
  const error = (
    messages: string[] | string = 'Error message',
    duration: number = NOTIFICATION_DURATION,
  ): void => {
    notify({
      title: 'Error',
      style: { borderColor: '#f44336' },
      iconName: 'error',
      messages,
      duration,
    });
  };

  /**
   * 'info' function is for notifying an action including some information, with predefined 'info' color, icon and title
   *
   * @param messages {string[] | string} - notification messages array or single message
   * @param duration {number} - duration of the notification
   */
  const info = (
    messages: string[] | string = 'Info message',
    duration: number = NOTIFICATION_DURATION,
  ): void => {
    notify({
      title: 'Info',
      style: { borderColor: '#2196f3' },
      iconName: 'info',
      messages,
      duration,
    });
  };

  return {
    state: {
      notifications: state.initialState,
    },
    engine: {
      ..._.omit(state, ['selectors']),
      ...state.selectors,
      notify,
      warning,
      success,
      error,
      info,
    },
  };
}

export default createNotificationsEngine;
