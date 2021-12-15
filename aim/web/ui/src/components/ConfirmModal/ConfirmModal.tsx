import React from 'react';

import { Dialog } from '@material-ui/core';

import { Button, Text } from 'components/kit';

import { IConfirmModalProps } from 'types/components/ConfirmModal/ConfirmModal';

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
            <Text
              size={14}
              className='ConfirmModal__Title'
              tint={100}
              component='h4'
              weight={600}
            >
              {props.title}
            </Text>
          )}

          <div>
            {props.text && (
              <Text
                className='ConfirmModal__description'
                weight={400}
                component='p'
                id='dialog-description'
              >
                {props.text || ''}
              </Text>
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
