import React from 'react';

import { IconName } from 'components/kit/Icon/Icon.d';

export interface IModalProps {
  opened: bool;
  onClose: () => void;
  onOk: () => void;
  title?: string | React.ReactNode;
  titleIconName?: IconName;
  titleIconColor?: string;
  cancelButtonText?: string | React.ReactNode;
  okButtonText?: string | React.ReactNode;
  modalType?: 'warning' | 'error' | 'info' | 'success';
  okButtonColor?: string;
  withoutTitleIcon?: boolean;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}
