import React from 'react';
import classNames from 'classnames';

import { Dialog } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';

import { IModalProps } from './Modal.d';

import './Modal.scss';

const ModalType: any = {
  warning: {
    iconName: 'warning-contained',
  },
  error: { iconName: 'close-circle' },
  info: { iconName: 'circle-info' },
  success: { iconName: 'success-icon' },
};

function Modal({
  opened,
  onClose,
  onOk,
  title,
  titleIconName,
  cancelButtonText = 'Cancel',
  modalType = 'info',
  okButtonText = 'Ok',
  okButtonColor,
  withoutTitleIcon,
  children,
  maxWidth = 'sm',
  ...rest
}: IModalProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Dialog
      open={opened}
      onClose={onClose}
      aria-labelledby='form-dialog-title'
      maxWidth={maxWidth}
      {...rest}
    >
      <div className={`Modal ${modalType}`}>
        <div className='Modal__header'>
          {!withoutTitleIcon && (
            <div
              className={classNames('Modal__header__titleIcon', {
                [modalType as string]: modalType,
              })}
            >
              <Icon
                name={titleIconName || ModalType[modalType ?? ''].iconName}
                fontSize={16}
              />
            </div>
          )}
          {title && (
            <div className={classNames('Modal__header__title', {})}>
              {typeof title === 'string' ? (
                <Text size={16} weight={600}>
                  {title}
                </Text>
              ) : (
                title
              )}
            </div>
          )}
        </div>
        <div className='Modal__content'>{children}</div>
        <div className='Modal__footer'>
          <Button className='Modal__footer__okCancel' onClick={onClose}>
            {cancelButtonText}
          </Button>
          <Button
            onClick={onOk}
            variant='contained'
            className={'Modal__footer__okButton'}
            style={{ background: okButtonColor }}
          >
            {okButtonText}
          </Button>
        </div>
        <Button
          withOnlyIcon
          className='Modal__closeButton'
          size='small'
          onClick={onClose}
        >
          <Icon name='close' fontSize={12} />
        </Button>
      </div>
    </Dialog>
  );
}

Modal.displayName = 'Modal';

export default React.memo<IModalProps>(Modal);
