import React from 'react';

import * as Toast from '@radix-ui/react-toast';
import { StyledComponent } from '@stitches/react/types/styled-component';

import { ColorPaletteType, styled } from 'config/stitches/stitches.config';
import {
  fadeOut,
  toastSlideIn,
  toastSwipeOut,
} from 'config/stitches/stitches.animations';

import Button from '../Button';
import IconButton from '../IconButton';
import Box from '../Box';
import Icon from '../Icon';

import { IToastProps } from './Toast.d';

export const ToastRoot: StyledComponent<typeof Toast.Root, any> = styled(
  Toast.Root,
  {
    bc: '$textPrimary',
    color: 'white',
    display: 'flex',
    bs: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
    p: '$6 $9',
    ai: 'center',
    '&[data-state="open"]': {
      animation: `${toastSlideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    },
    '&[data-state="closed"]': {
      animation: `${fadeOut} 100ms ease-out`,
    },
    '&[data-swipe="move"]': {
      transform: 'translateX(var(--radix-toast-swipe-move-x))',
    },
    '&[data-swipe="cancel"]': {
      transform: 'translateX(0)',
    },
    '&[data-swipe="end"]': {
      animation: `${toastSwipeOut} 100ms ease-out`,
    },
    br: '$3',
    zIndex: '$max',
    variants: {
      hasAction: {
        true: { p: '$5 $9' },
      },
      status: {
        info: {},
        success: {
          bc: '$success100',
        },
        warning: {
          bc: '$warning100',
        },
        danger: {
          bc: '$danger100',
        },
      },
    },
  },
);

export const ToastTitle = styled(Toast.Title, {
  mb: '$1',
  fontWeight: 500,
  color: 'red',
});

export const ToastDescription = styled(Toast.Description, {
  margin: 0,
  wordBreak: 'break-word',
  userSelect: 'text',
  cursor: 'default',
  color: 'slate',
  fontSize: '$4',
  lineHeight: '$5',
});

export const ToastAction = styled('div', {
  display: 'flex',
  ai: 'center',
  jc: 'center',
  ml: '$8',
  alignSelf: 'start',
});

/**
 * Toast component
 * @param {IToastProps} props
 * @param {object} css - css object
 * @param {string} message - message to display
 * @param {React.ReactNode} icon - icon to display
 * @param {Function} onUndo - callback function to call when undo button is clicked
 * @param {Function} onDelete - callback function to call when delete button is clicked
 * @param {string} id - id of the toast
 * @param {string} status - status of the toast
 * @param {object} rest - rest of the props
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @see https://www.radix-ui.com/docs/primitives/components/toast
 * @see https://stitches.dev/docs/overriding-styles#the-css-prop
 * @constructor
 * @example
 * import { Toast } from 'components/kit_v2/Toast';
 * <Toast
 *  message='This is a toast message'
 * icon={<Icon icon='info' />}
 * onUndo={() => console.log('undo')}
 * onDelete={() => console.log('delete')}
 * id='1'
 * status='info'
 * />
 */

const ToastItem = React.forwardRef<typeof ToastRoot, IToastProps>(
  (
    {
      css,
      message,
      icon,
      onUndo,
      onDelete,
      id,
      status = 'danger',
      ...rest
    }: IToastProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const hasAction = React.useMemo(
      () => !!onUndo || !!onDelete,
      [onUndo, onDelete],
    );

    return (
      <ToastRoot
        {...rest}
        ref={forwardedRef}
        status={status}
        hasAction={hasAction}
        css={css}
        className='ToastRoot'
      >
        {icon ? (
          <Box as='span' css={{ mr: '$5', lineHeight: 1, size: '$1' }}>
            <Icon css={{ color: 'white' }} icon={icon} />
          </Box>
        ) : null}
        <ToastDescription>{message}</ToastDescription>
        {onDelete || onUndo ? (
          <ToastAction className='ToastAction'>
            {onUndo ? (
              <Button
                color={status as ColorPaletteType}
                css={{ ml: '$4' }}
                onClick={() => onUndo(id)}
                data-testid='undo-toast'
              >
                Undo
              </Button>
            ) : null}
            {onDelete ? (
              <IconButton
                css={{ ml: '$4' }}
                color={status as ColorPaletteType}
                icon='close'
                data-testid='delete-toast'
                onClick={() => onDelete(id)}
              >
                Delete
              </IconButton>
            ) : null}
          </ToastAction>
        ) : null}
      </ToastRoot>
    );
  },
);

export default React.memo(ToastItem);
