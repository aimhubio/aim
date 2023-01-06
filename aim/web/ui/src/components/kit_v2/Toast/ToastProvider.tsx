import React from 'react';

import * as Toast from '@radix-ui/react-toast';
import { StyledComponent } from '@stitches/react/types/styled-component';

import { styled } from 'config/stitches/stitches.config';

import { IToastProviderProps } from './Toast.d';

const ToastViewPort = styled(Toast.Viewport, {
  position: 'fixed',
  bottom: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  padding: '$8',
  gap: '$5',
  maxWidth: '50vw',
  minWidth: '300px',
  margin: 0,
  listStyle: 'none',
  zIndex: '$',
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

const StyledToastProvider: StyledComponent<typeof Toast.ToastProvider, any> =
  styled(Toast.Provider, {});

/**
 * ToastProvider is a wrapper component for the Toast components that allows you to control the placement of the Toasts.
 * It should be used as a wrapper component for the Toast components.
 * @param {React.ReactNode} children - The children to be rendered.
 * @param {string} placement - The placement of the Toasts.
 * @param {string} swipeDirection - The swipe direction of the Toasts.
 * @param {string} className - The className of the ToastProvider.
 * @param {string} id - The id of the ToastProvider.
 * @param {string} style - The style of the ToastProvider.
 * @param {string} ref - The ref of the ToastProvider.
 * @returns {React.FunctionComponentElement<React.ReactNode>} - The ToastProvider component.
 * @constructor
 * @example
 * import { ToastProvider } from 'components/kit_v2/Toast';
 * import { Toast } from 'components/kit_v2/Toast';
 * const Example = () => {
 *  return (
 *   <ToastProvider placement='bottomRight'>
 *    <Toast />
 *  </ToastProvider>
 * );
 * };
 *
 */

const ToastProvider = React.forwardRef<
  typeof StyledToastProvider,
  IToastProviderProps
>(
  (
    { children, placement = 'bottomRight', ...rest }: IToastProviderProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <StyledToastProvider {...rest} ref={forwardedRef}>
        {children}
        <ToastViewPort placement={placement} className='ToastViewport' />
      </StyledToastProvider>
    );
  },
);

export default React.memo(ToastProvider);
