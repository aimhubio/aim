import * as React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { ToastProvider, Toast } from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';

import useApp from './useApp';
import AppPage from './components/AppPage';

function App(): React.FunctionComponentElement<React.ReactNode> {
  const { data, isLoading, notifications, setAppName } = useApp();

  const match = useRouteMatch<{ appName: string }>();
  const appName = match.params['appName'];

  React.useEffect(() => {
    setAppName(appName);
  }, [appName]);

  return (
    <ErrorBoundary>
      {isLoading ? null : (
        <Route
          path={[
            `${PathEnum.App.replace(':appName', appName)}/*`,
            `${PathEnum.App.replace(':appName', appName)}/*/edit`,
          ]}
          exact
        >
          {(props) => (
            <AppPage
              key={props.location.pathname}
              {...props}
              data={data}
              appName={appName}
            />
          )}
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
