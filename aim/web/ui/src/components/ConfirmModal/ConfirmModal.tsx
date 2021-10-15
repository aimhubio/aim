import React from 'react';
import { IConfirmModalProps } from 'types/components/ConfirmModal/ConfirmModal';
import { Dialog, DialogContentText, DialogTitle } from '@material-ui/core';
import { Button } from 'components/kit';

import './ConfirmModal.scss';

function ConfirmModal(
  props: IConfirmModalProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Dialog
      open={props.open}
      onClose={props.onCancel}
      aria-labelledby='dialog-title'
      aria-describedby='dialog-description'
      PaperProps={{
        elevation: 10,
      }}
    >
      <div className='ConfirmModal__Body'>
        <div className='ConfirmModal__Icon flex fjc fac'>{props.icon}</div>
        <div className='flex fdc'>
          {props.title && (
            <DialogTitle className='ConfirmModal__Title' id='dialog-title'>
              {props.title}
            </DialogTitle>
          )}

          <div className='ConfirmModal__Content'>
            {props.text && (
              <DialogContentText className='Text' id='dialog-description'>
                {props.text || ''}
              </DialogContentText>
            )}
            {props.children && props.children}
          </div>
        </div>
      </div>
      <div className='ConfirmModal__Footer'>
        <Button onClick={props.onCancel} className='ConfirmModal__CancelButton'>
          {props.cancelBtnText}
        </Button>

        <Button
          onClick={props.onSubmit}
          color='primary'
          variant='contained'
          autoFocus
        >
          {props.confirmBtnText}
        </Button>
      </div>
    </Dialog>
  );
}

ConfirmModal.defaultProps = {
  confirmBtnText: 'Confirm',
  cancelBtnText: 'Cancel',
};

ConfirmModal.displayName = 'ConfirmModal';

export default React.memo<IConfirmModalProps>(ConfirmModal);
