import React from 'react';

import { Dialog } from '@material-ui/core';

import { Button, Text, Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IConfirmModalProps } from 'types/components/ConfirmModal/ConfirmModal';

import './ConfirmModal.scss';

function ConfirmModal(
  props: IConfirmModalProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <Dialog
        open={props.open}
        onClose={props.onCancel}
        aria-labelledby='dialog-title'
        aria-describedby='dialog-description'
        PaperProps={{
          elevation: 10,
        }}
        className={`ConfirmModal ConfirmModal__${props.statusType}`}
      >
        <div className='ConfirmModal__Body'>
          <Button
            size='small'
            className='ConfirmModal__Close__Icon'
            color='secondary'
            withOnlyIcon
            onClick={props.onCancel}
          >
            <Icon name='close' />
          </Button>

          <div className='ConfirmModal__Title__Container'>
            <div className='ConfirmModal__Icon'>{props.icon}</div>
            {props.title && (
              <Text size={16} tint={100} component='h4' weight={600}>
                {props.title}
              </Text>
            )}
          </div>

          <div>
            {props.text && (
              <Text
                size={14}
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

        <div className='ConfirmModal__Footer'>
          <Button
            onClick={props.onCancel}
            className='ConfirmModal__CancelButton'
          >
            {props.cancelBtnText}
          </Button>

          <Button
            onClick={props.onSubmit}
            color='primary'
            variant='contained'
            className='ConfirmModal__ConfirmButton'
            autoFocus
          >
            {props.confirmBtnText}
          </Button>
        </div>
      </Dialog>
    </ErrorBoundary>
  );
}

ConfirmModal.defaultProps = {
  confirmBtnText: 'Confirm',
  cancelBtnText: 'Cancel',
  statusType: 'info',
};

ConfirmModal.displayName = 'ConfirmModal';

export default React.memo<IConfirmModalProps>(ConfirmModal);
