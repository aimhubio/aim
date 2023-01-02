import React from 'react';

import * as Toast from '@radix-ui/react-toast';

import { styled } from 'config/stitches/stitches.config';

const ToastViewPort = styled(Toast.Viewport, {
  '--viewport-padding': '25px',
  position: 'fixed',
  bottom: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--viewport-padding)',
  gap: '10px',
  maxWidth: '100vw',
  margin: 0,
  listStyle: 'none',
  zIndex: '$',
  outline: 'none',
});

const ToastProvider = React.forwardRef<
  typeof Toast.Provider,
  Toast.ToastProviderProps
>(
  (
    { css, children, swipeDirection = 'right', ...rest }: any,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <Toast.Provider
        ref={forwardedRef}
        swipeDirection={swipeDirection}
        {...rest}
      >
        {children}
        <ToastViewPort className='ToastViewport' />
      </Toast.Provider>
    );
  },
);

export default React.memo(ToastProvider);
