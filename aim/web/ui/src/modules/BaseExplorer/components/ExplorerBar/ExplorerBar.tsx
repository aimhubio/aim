import React from 'react';

import { MenuItem } from '@material-ui/core';
import { IExplorerBarProps } from 'modules/BaseExplorer/types';
import { PipelineStatusEnum } from 'modules/core/engine';

import AppBar from 'components/AppBar/AppBar';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon } from 'components/kit';

import './ExplorerBar.scss';

function ExplorerBar(props: IExplorerBarProps) {
  const isExecuting =
    props.engine.useStore(props.engine.pipelineStatusSelector) ===
    PipelineStatusEnum.Executing;
  return (
    <div>
      <AppBar title={props.explorerName} disabled={isExecuting}>
        <div className='ExplorerBar__menu'>
          <ErrorBoundary>
            <ControlPopover
              title='Menu'
              anchor={({ onAnchorClick }) => (
                <Button
                  withOnlyIcon
                  color='secondary'
                  size='small'
                  onClick={(d: any) => !isExecuting && onAnchorClick(d)}
                >
                  <Icon
                    fontSize={16}
                    name='menu'
                    className='ExplorerBar__item__bookmark__Icon'
                  />
                </Button>
              )}
              component={
                <div className='ExplorerBar__popover'>
                  <MenuItem onClick={props.engine.resetConfigs}>
                    Reset Controls to System Defaults
                  </MenuItem>
                  <a
                    href={props.documentationLink}
                    target='_blank'
                    rel='noreferrer'
                    className='ExplorerBar__popover__docsLink'
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
