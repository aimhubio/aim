import React from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';

import { IConfirmModalProps } from 'types/components/ConfirmModal/ConfirmModal';

function ConfirmModal({
  text,
  onSubmit,
  onCancel,
  open,
}: IConfirmModalProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby='dialog-title'
      aria-describedby='dialog-description'
    >
      <DialogTitle id='dialog-title'>Are you sure?</DialogTitle>
      <DialogContent>
        <DialogContentText id='dialog-description'>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color='primary'>
          Cancel
        </Button>
        <Button onClick={onSubmit} color='primary' autoFocus>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(ConfirmModal);
