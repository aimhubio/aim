import React from 'react';

import AppBar from 'components/AppBar/AppBar';
import LiveUpdateSettings from 'components/LiveUpdateSettings/LiveUpdateSettings';

function RunsBar(props: {
  enabled: boolean;
  delay: number;
  onLiveUpdateConfigChange: () => void;
}): React.FunctionComponentElement<React.ReactNode> {
  return (
    <AppBar title='Runs explorer'>
      <LiveUpdateSettings {...props} />
    </AppBar>
  );
}

export default React.memo(RunsBar);
