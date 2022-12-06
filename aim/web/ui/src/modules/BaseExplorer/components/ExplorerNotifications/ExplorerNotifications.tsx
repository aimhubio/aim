import React from 'react';
import _ from 'lodash-es';

import { Fade, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IExplorerNotificationProps } from '../../types';
import { INotificationItem } from '../../../core/engine/types';

import { getNotificationIcon } from './config';

import './ExplorerNotifications.scss';

function ExplorerNotifications(props: IExplorerNotificationProps) {
  const {
    engine: {
      useStore,
      notifications: { notificationsSelector, remove },
    },
  } = props;
  const notifications: INotificationItem[] = useStore(notificationsSelector);

  return (
    <ErrorBoundary>
      {!_.isEmpty(notifications) ? (
        <div className='ExplorerNotifications'>
          <Snackbar
            open={true}
            transitionDuration={{ enter: 100 }}
            TransitionComponent={Fade}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <div>
              {notifications.map(
                ({
                  id = '',
                  title = '',
                  messages = [],
                  style = {},
                  iconName = '',
                }) => (
                  <Alert
                    key={id}
                    className='ExplorerNotifications__item'
                    onClose={() => remove(id)}
                    variant='outlined'
                    icon={getNotificationIcon(iconName)}
                    style={{ height: 'auto', ...style }}
                  >
                    <div className='ExplorerNotifications__item__content'>
                      {title ? (
                        <p className='ExplorerNotifications__item__content__title'>
                          {title}
                        </p>
                      ) : null}
                      {messages.map((message: string, i: number) =>
                        message ? (
                          <p
                            key={`${message}-${i}`}
                            className='ExplorerNotifications__item__content__message'
                          >
                            {message}
                          </p>
                        ) : null,
                      )}
                    </div>
                  </Alert>
                ),
              )}
            </div>
          </Snackbar>
        </div>
      ) : null}
    </ErrorBoundary>
  );
}

export default React.memo(ExplorerNotifications);
