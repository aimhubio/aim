import create from 'zustand';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

function createNotificationEngine() {
  const state = create<{ data: INotification[] }>(() => ({
    data: [],
  }));

  const onNotificationDelete = (id: number) => {
    const notificationList = state.getState().data;
    state.setState({
      data: notificationList.filter((notification) => notification.id !== id),
    });
  };

  const onNotificationAdd = (notificationData: INotification) => {
    const notificationList = state.getState().data ?? [];
    state.setState({ data: [...notificationList, notificationData] });
    setTimeout(() => {
      onNotificationDelete(notificationData.id);
    }, 3000);
  };

  return { notificationState: state, onNotificationDelete, onNotificationAdd };
}

export default createNotificationEngine();
