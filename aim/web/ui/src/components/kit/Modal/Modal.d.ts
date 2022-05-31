import React from 'react';

import { DialogProps } from '@material-ui/core';

import { IconName } from 'components/kit/Icon/Icon.d';

import { Override } from 'types/utils/common';

export type IModalProps = Override<
  DialogProps,
  {
    open: boolean;
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
    isOkButtonDisabled?: boolean;
    className?: string;
  }
>;
