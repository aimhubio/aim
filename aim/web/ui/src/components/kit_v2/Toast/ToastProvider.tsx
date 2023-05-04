import React from 'react';

import { IToastProviderProps } from './Toast.d';
import { StyledToastProvider, ToastViewPort } from './Toast.style';

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
