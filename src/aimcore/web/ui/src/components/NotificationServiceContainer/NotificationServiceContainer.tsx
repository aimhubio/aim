import { Toast, ToastProvider } from 'components/kit_v2';

import useNotificationServiceStore from './NotificationServiceStore';

function NotificationServiceContainer(): React.FunctionComponentElement<React.ReactNode> {
  const notificationsList = useNotificationServiceStore(
    (state) => state.notificationsList,
  );
  return (
    <ToastProvider
      placement='bottomRight'
      swipeDirection='right'
      duration={5000}
    >
      {notificationsList.map((notification) => (
        <Toast
          key={notification.id}
          onOpenChange={(open) => {
            if (!open && notification.onDelete) {
              notification.onDelete(notification.id)!;
            }
          }}
          {...notification}
        />
      ))}
    </ToastProvider>
  );
}

export default NotificationServiceContainer;
