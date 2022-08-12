import React from 'react';

import { MenuItem } from '@material-ui/core';

import AppBar from 'components/AppBar/AppBar';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon } from 'components/kit';

import { IBaseComponentProps } from '../../types';

interface IExplorerBarProps extends IBaseComponentProps {
  explorerName: string;
  documentationLink: string;
}

function ExplorerBar(props: IExplorerBarProps) {
  // const resetControls = props.engine.resetConfigs;
  function resetAll() {
    // props.engine.boxConfig.methods.reset();
    // props.engine.groupings.reset();
    // resetControls();
  }
  return (
    <div>
      <AppBar title={props.explorerName}>
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
                  <MenuItem onClick={resetAll}>
                    Reset Controls to System Defaults
                  </MenuItem>
                  <a
                    href={props.documentationLink}
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
    </div>
  );
}

export default ExplorerBar;
