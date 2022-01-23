import React from 'react';

export interface IConfirmModalProps {
  open: boolean;
  text?: string;
  icon: React.ReactNode;
  title?: string;
  cancelBtnText?: string;
  confirmBtnText?: string;
  children?: React.ReactNode;
  onSubmit: () => void;
  onCancel: () => void;
  statusType?: error | success | warning | info;
}
