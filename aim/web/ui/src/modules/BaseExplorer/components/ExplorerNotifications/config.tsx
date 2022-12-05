import React from 'react';

import { ReactComponent as SuccessIcon } from 'assets/icons/successIcon.svg';
import { ReactComponent as ErrorIcon } from 'assets/icons/errorIcon.svg';

const NotificationIcons: Record<string, React.ReactNode> = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
  warning: null, // @TODO: add warning icon
  info: null, // @TODO: add info icon
};

export const getNotificationIcon = (iconName: string) => {
  return NotificationIcons[iconName];
};
