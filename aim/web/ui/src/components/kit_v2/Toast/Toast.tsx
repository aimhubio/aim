import React from 'react';

import * as Toast from '@radix-ui/react-toast';
import { StyledComponent } from '@stitches/react/types/styled-component';

import { ColorPaletteEnum, styled } from 'config/stitches/stitches.config';

import Button from '../Button';
import IconButton from '../IconButton';

import { IToastProps } from './Toast.d';

export const ToastRoot: StyledComponent<typeof Toast.Root, any> = styled(
  Toast.Root,
  {
    bc: '$textPrimary',
    color: 'white',
    display: 'flex',
    bs: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
    p: '$5',
    ai: 'center',
    '&[data-state="open"]': {
      animation: 'slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
    },
    '&[data-state="closed"]': {
      animation: 'hide 100ms ease-in',
    },
    '&[data-swipe="move"]': {
      transform: 'translateX(var(--radix-toast-swipe-move-x))',
    },
    '&[data-swipe="cancel"]': {
      transform: 'translateX(0)',
      transition: 'transform 200ms ease-out',
    },
    '&[data-swipe="end"]': {
      animation: 'swipeOut 100ms ease-out',
    },
    br: '$3',
    variants: {
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
  color: 'slate',
  fontSize: '$4',
  lineHeight: '$5',
});

export const ToastAction = styled(Toast.Action, {});

/**
 * Toast component
 * @param {IToastProps} props
 * @param {keyof HTMLElementTagNameMap} as - HTML element or React component
 * @param {object} css - css object
 * @param {React.ReactNode} children - React children
 * @param {Partial<React.AllHTMLAttributes<HTMLElement>>} rest - HTML attributes
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @see https://www.radix-ui.com/docs/primitives/components/toast
 * @see https://stitches.dev/docs/overriding-styles#the-css-prop
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
    return (
      <ToastRoot
        status={status}
        css={css}
        ref={forwardedRef}
        className='ToastRoot'
      >
        {icon ? icon : null}
        <ToastDescription>{message}</ToastDescription>
        {onDelete || onUndo ? (
          <div className='ToastAction'>
            {onUndo ? (
              <Button
                color={status as any}
                css={{ ml: '$2' }}
                onClick={() => onUndo(id)}
              >
                Undo
              </Button>
            ) : null}
            {onDelete ? (
              <IconButton
                css={{ ml: '$2' }}
                size='xs'
                color={status as any}
                icon='close'
                onClick={() => onDelete(id)}
              >
                Delete
              </IconButton>
            ) : null}
          </div>
        ) : null}
      </ToastRoot>
    );
  },
);

export default React.memo(ToastItem);
