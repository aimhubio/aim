import React from 'react';

import { Alert } from '@material-ui/lab';
import { Box, Snackbar } from '@material-ui/core';

import successIconImg from 'assets/icons/successIcon.svg';
import errorIconImg from 'assets/icons/errorIcon.svg';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { INotificationContainer } from 'types/components/NotificationContainer/NotificationContainer';

import './NotificationContainer.scss';

export default function NotificationContainer({
  data,
  handleClose,
}: INotificationContainer): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div>
        <Snackbar
          open={true}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <div className='NotificationContainer'>
            {data.map(({ id, severity, message }) => (
              <Box key={id} mt={0.5}>
                <Alert
                  onClose={() => handleClose(+id)}
                  variant='outlined'
                  severity={severity}
                  iconMapping={{
                    success: <img src={successIconImg} alt='' />,
                    error: <img src={errorIconImg} alt='' />,
                  }}
                >
                  <div className='NotificationContainer__contentBox'>
                    <p className='NotificationContainer__contentBox__severity'>
                      {severity}
                    </p>
                    <p className='NotificationContainer__contentBox__message'>
                      {message}
                    </p>
                  </div>
                </Alert>
              </Box>
            ))}
          </div>
        </Snackbar>
      </div>
    </ErrorBoundary>
  );
}
