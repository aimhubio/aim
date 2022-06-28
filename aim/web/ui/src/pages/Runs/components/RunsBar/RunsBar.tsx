import React from 'react';

import { MenuItem } from '@material-ui/core';

import AppBar from 'components/AppBar/AppBar';
import LiveUpdateSettings from 'components/LiveUpdateSettings/LiveUpdateSettings';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Button, Icon } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';

import pageTitlesEnum from 'config/pageTitles/pageTitles';
import { DOCUMENTATIONS } from 'config/references';

import 'pages/Metrics/components/MetricsBar/MetricsBar.scss';

function RunsBar(props: {
  enabled: boolean;
  delay: number;
  onLiveUpdateConfigChange: () => void;
  disabled: boolean;
}): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <AppBar title={pageTitlesEnum.RUNS_EXPLORER} disabled={props.disabled}>
        <LiveUpdateSettings {...props} />
        <div className='MetricsBar__menu'>
          <ErrorBoundary>
            <ControlPopover
              title='Menu'
              anchor={({ onAnchorClick }) => (
                <Button
                  withOnlyIcon
                  color='secondary'
                  size='small'
                  onClick={onAnchorClick}
                >
                  <Icon
                    fontSize={16}
                    name='menu'
                    className='MetricsBar__item__bookmark__Icon'
                  />
                </Button>
              )}
              component={
                <div className='MetricsBar__popover'>
                  <a
                    href={DOCUMENTATIONS.EXPLORERS.RUNS.MAIN}
                    target='_blank'
                    rel='noreferrer'
                  >
                    <MenuItem>Explorer Documentation</MenuItem>
                  </a>
                </div>
              }
            />
          </ErrorBoundary>
        </div>
      </AppBar>
    </ErrorBoundary>
  );
}

export default React.memo(RunsBar);
