import React from 'react';
import AppBar from 'components/AppBar/AppBar';

function RunsBar(): React.FunctionComponentElement<React.ReactNode> {
  return <AppBar title='Runs explorer' />;
}

export default React.memo(RunsBar);
