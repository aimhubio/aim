import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconCheck } from '@tabler/icons';

import {
  Toast as ToastComponent,
  ToastProvider,
} from 'components/kit_v2/Toast';
import Button from 'components/kit_v2/Button';
import { IToastProps } from 'components/kit_v2/Toast/Toast.d';

export default {
  title: 'Kit/Inputs',
  component: ToastComponent,
} as ComponentMeta<typeof ToastComponent>;

const Template: ComponentStory<typeof ToastComponent> = (args) => {
  const [notifications, setNotifications] = React.useState<IToastProps[]>([]);

  function onAddToast() {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = {
      id,
      icon: <IconCheck />,
      message: 'Aim is an open-source, self-hosted ML experiment tracking tool',
      onDelete: () => {
        setNotifications((notifications) =>
          notifications.filter((n) => n.id !== id),
        );
      },
      onUndo: () => {
        setNotifications((notifications) =>
          notifications.filter((n) => n.id !== id),
        );
      },
    };
    setNotifications((list) => [...list, notification]);
  }

  return (
    <div>
      <Button onClick={onAddToast}>Add Toast</Button>
      <ToastProvider swipeDirection='right'>
        {notifications.map((notification) => (
          <ToastComponent
            {...args}
            key={notification.id}
            // onOpenChange={(open) => {
            //   if (!open && notification.onDelete) {
            //     notification.onDelete(notification.id)!;
            //   }
            // }}
            {...notification}
          />
        ))}
      </ToastProvider>
    </div>
  );
};

export const Toast = Template.bind({});

Toast.args = {};
