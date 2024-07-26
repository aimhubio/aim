import * as Toast from '@radix-ui/react-toast';
import { StyledComponent } from '@stitches/react/types/styled-component';

import {
  fadeOut,
  toastSlideIn,
  toastSwipeOut,
} from 'config/stitches/animations';
import { styled } from 'config/stitches';

export const ToastRoot: StyledComponent<typeof Toast.Root, any> = styled(
  Toast.Root,
  {
    bc: '$background-default-text-deep',
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
          bc: '$background-default-success-plain',
        },
        warning: {
          bc: '$background-default-warning-plain',
        },
        danger: {
          bc: '$background-default-danger-plain',
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

export const ToastViewPort = styled(Toast.Viewport, {
  position: 'fixed',
  bottom: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  padding: '$8',
  gap: '$5',
  maxWidth: '50vw',
  zIndex: '$max',
  minWidth: '300px',
  margin: 0,
  listStyle: 'none',
  outline: 'none',
  ai: 'flex-end',
  variants: {
    placement: {
      topLeft: {
        top: 0,
        left: 0,
        ai: 'flex-start',
      },
      topRight: {
        top: 0,
        right: 0,
        ai: 'flex-start',
      },
      bottomLeft: {
        bottom: 0,
        left: 0,
        ai: 'flex-end',
      },
      bottomRight: {
        bottom: 0,
        right: 0,
        ai: 'flex-end',
      },
    },
  },
});

export const StyledToastProvider: StyledComponent<
  typeof Toast.ToastProvider,
  any
> = styled(Toast.Provider, {});
