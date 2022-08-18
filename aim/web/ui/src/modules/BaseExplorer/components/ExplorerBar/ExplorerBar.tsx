import React from 'react';

import { MenuItem } from '@material-ui/core';

import AppBar from 'components/AppBar/AppBar';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon } from 'components/kit';

import { IBaseComponentProps } from '../../types';

import './ExplorerBar.scss';

interface IExplorerBarProps extends IBaseComponentProps {
  explorerName: string;
  documentationLink: string;
}

function ExplorerBar(props: IExplorerBarProps) {
  return (
    <div>
      <AppBar title={props.explorerName}>
        <div className='ExplorerBar__menu'>
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
