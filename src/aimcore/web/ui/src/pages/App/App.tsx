import * as React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { ToastProvider, Toast } from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';

import useApp from './useApp';
import AppPage from './components/AppPage';

function App(): React.FunctionComponentElement<React.ReactNode> {
  const { data, isLoading, notifications } = useApp();

  return (
    <ErrorBoundary>
      {isLoading ? null : (
        <Route path={[`${PathEnum.App}/*`, `${PathEnum.App}/*/edit`]} exact>
          {(props) => <AppPage {...props} data={data} />}
        </Route>
      )}
      <ToastProvider
        placement='bottomRight'
        swipeDirection='right'
        duration={5000}
      >
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            onOpenChange={(open) => {
              if (!open && notification.onDelete) {
                notification.onDelete(notification.id)!;
              }
            }}
            {...notification}
          />
        ))}
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
