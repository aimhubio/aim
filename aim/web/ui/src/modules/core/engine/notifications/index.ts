import _ from 'lodash-es';

import { ExtractState, INotificationItem, INotificationsState } from '../types';

import createState, { getInitialState } from './state';

type NotifyMethod = (args: {
  title?: string;
  messages?: string[] | string;
  style?: {};
  iconName?: string;
  duration?: number;
}) => void;
type WarningMethod = (messages: string[] | string, duration: number) => void;
type SuccessMethod = (messages: string[] | string, duration: number) => void;
type ErrorMethod = (messages: string[] | string, duration: number) => void;
type InfoMethod = (messages: string[] | string, duration: number) => void;

export interface INotificationsEngine<TStore = object> {
  state: INotificationsSlice;
  engine: {
    addNotification: (notificationItem: INotificationItem) => void;
    removeNotification: (id: string) => void;
    notify: NotifyMethod;
    warning: WarningMethod;
    success: SuccessMethod;
    error: ErrorMethod;
    info: InfoMethod;
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
  ) => {
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
   * @param args {object} - notification item
   */
  const notify: NotifyMethod = ({
    title = 'Notification',
    messages = 'Notification message',
    style = {},
    iconName = '',
    duration = NOTIFICATION_DURATION,
  }) => {
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
  const warning: WarningMethod = (
    messages = 'Warning message',
    duration = NOTIFICATION_DURATION,
  ) => {
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
  const success: SuccessMethod = (
    messages = 'Success message',
    duration = NOTIFICATION_DURATION,
  ) => {
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
  const error: ErrorMethod = (
    messages = 'Error message',
    duration = NOTIFICATION_DURATION,
  ) => {
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
  const info: InfoMethod = (
    messages = 'Info message',
    duration = NOTIFICATION_DURATION,
  ) => {
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
