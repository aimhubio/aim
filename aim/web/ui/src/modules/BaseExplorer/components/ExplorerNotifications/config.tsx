import * as React from 'react';

import { ReactComponent as SuccessIcon } from 'assets/icons/notifications/success.svg';
import { ReactComponent as ErrorIcon } from 'assets/icons/notifications/error.svg';
import { ReactComponent as InfoIcon } from 'assets/icons/notifications/info.svg';
import { ReactComponent as WarningIcon } from 'assets/icons/notifications/warning.svg';

const NotificationIcons: Record<string, React.ReactNode> = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
};

export const getNotificationIcon = (iconName: string) => {
  return NotificationIcons[iconName] || false;
};
