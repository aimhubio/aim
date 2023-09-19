import * as React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Link } from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';

import usePyodide from 'services/pyodide/usePyodide';

function Apps(): React.FunctionComponentElement<React.ReactNode> {
  const { registeredPackages, isLoading } = usePyodide();
  return (
    <ErrorBoundary>
      {isLoading
        ? null
        : registeredPackages.map((appName: string) => (
            <Link
              key={appName}
              to={`${PathEnum.App.replace(':appName', appName)}`}
            >
              {appName}
            </Link>
          ))}
    </ErrorBoundary>
  );
}

export default Apps;
