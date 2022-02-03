import React from 'react';

import AppBar from 'components/AppBar/AppBar';
import LiveUpdateSettings from 'components/LiveUpdateSettings/LiveUpdateSettings';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

function RunsBar(props: {
  enabled: boolean;
  delay: number;
  onLiveUpdateConfigChange: () => void;
}): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <AppBar title='Runs explorer'>
        <LiveUpdateSettings {...props} />
      </AppBar>
    </ErrorBoundary>
  );
}

export default React.memo(RunsBar);
