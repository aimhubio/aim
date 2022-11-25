import React from 'react';

import { INotification } from './NotificationContainer.d';
import notificationEngine from './NotificationContainerStore';

function useNotificationContainer() {
  const { current: engine } = React.useRef(notificationEngine);
  const notificationState: { data: INotification[] } = engine.notificationState(
    (state: { data: INotification[] }) => state,
  );

  return {
    notificationState: notificationState?.data || [],
    onNotificationDelete: engine.onNotificationDelete,
    onNotificationAdd: engine.onNotificationAdd,
  };
}

export default useNotificationContainer;
