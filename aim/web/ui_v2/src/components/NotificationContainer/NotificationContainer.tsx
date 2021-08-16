import React from 'react';
import { Alert } from '@material-ui/lab';
import { Box, Snackbar } from '@material-ui/core';

import { INotificationContainer } from 'types/components/NotificationContainer/NotificationContainer';

export default function NotificationContainer({
  data,
  handleClose,
}: INotificationContainer): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Snackbar
        open={true}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <div>
          {data.map(({ id, severity, message }) => (
            <Box key={id} mt={0.5}>
              <Alert onClose={() => handleClose(+id)} severity={severity}>
                {message}
              </Alert>
            </Box>
          ))}
        </div>
      </Snackbar>
    </Box>
  );
}
