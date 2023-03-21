import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconCheck } from '@tabler/icons-react';

import {
  Toast as ToastComponent,
  ToastProvider,
} from 'components/kit_v2/Toast';
import Button from 'components/kit_v2/Button';
import { IToastProps } from 'components/kit_v2/Toast/Toast.d';

export default {
  title: 'Kit/Feedback',
  component: ToastComponent,
  argTypes: {
    placement: {
      control: 'radio',
      options: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
    },
    id: {
      control: 'text',
    },
    swipeDirection: {
      control: 'radio',
      options: ['left', 'right', 'up', 'down'],
    },
    duration: {
      control: 'number',
    },
  },
} as ComponentMeta<typeof ToastComponent>;

const Template: ComponentStory<typeof ToastComponent> = (args: any) => {
  const [notifications, setNotifications] = React.useState<IToastProps[]>([]);

  function onAddToast() {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = {
      id,
      icon: <IconCheck />,
      message:
        args.message ||
        'Aim is an open-source, self-hosted ML experiment tracking tool',
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
      <ToastProvider
        placement={args.placement}
        swipeDirection={args.swipeDirection}
        duration={args.duration}
      >
        {notifications.map((notification) => (
          <ToastComponent
            {...args}
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
    </div>
  );
};

export const Toast = Template.bind({});

Toast.args = {
  duration: 5000,
};
