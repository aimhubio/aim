import create from 'zustand';

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleDot,
  IconDiscountCheck,
} from '@tabler/icons-react';

import { IToastProps } from 'components/kit_v2/Toast';

import generateId from 'utils/generateId';

interface NotificationsStore {
  notificationsList: IToastProps[];
  onNotificationDelete: (id: string) => void;
  onNotificationAdd: ({ status, message, icon }: any) => void;
  destroy: () => void;
}

/**
 * @description - get icon for notification by status
 * @param status  - status of notification
 * @returns icon - icon for notification
 */
function getIcon(status: string): React.ReactNode | null {
  switch (status) {
    case 'success':
      return <IconDiscountCheck />;
    case 'warning':
      return <IconAlertCircle />;
    case 'danger':
      return <IconAlertTriangle />;
    case 'info':
      return <IconCircleDot />;
    default:
      return null;
  }
}

const useNotificationServiceStore = create<NotificationsStore>((set, get) => ({
  notificationsList: [],
  onNotificationAdd: ({
    status = 'success',
    message = '',
    icon = null,
  }: any) => {
    const id = generateId();
    const notification: IToastProps = {
      id,
      icon: getIcon(status) || icon,
      status,
      message,
      onDelete: (id: any) => {
        get().onNotificationDelete(id);
      },
    };
    set({
      notificationsList: [...get().notificationsList, notification],
    });
  },
  onNotificationDelete: (id: string) => {
    set({
      notificationsList: [...get().notificationsList].filter(
        (n) => n.id !== id,
      ),
    });
  },
  destroy: () => {
    set({ notificationsList: [] });
  },
}));

export default useNotificationServiceStore;
