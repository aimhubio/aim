import React, { useCallback } from 'react';

import { MenuItem } from '@material-ui/core';

import AppBar from 'components/AppBar/AppBar';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon } from 'components/kit';

import { PipelineStatusEnum } from 'modules/core/engine/types';
import { IExplorerBarProps } from 'modules/BaseExplorer/types';

import './ExplorerBar.scss';

function ExplorerBar(props: IExplorerBarProps) {
  const status = props.engine.useStore(props.engine.pipeline.statusSelector);

  const disableResetControls = React.useMemo(
    () =>
      [
        PipelineStatusEnum.Never_Executed,
        PipelineStatusEnum.Empty,
        PipelineStatusEnum.Insufficient_Resources,
        PipelineStatusEnum.Executing,
      ].indexOf(status) !== -1,
    [status],
  );

  const resetToSystemDefaults = useCallback(() => {
    if (!disableResetControls) {
      props.engine.visualizations.reset();
      props.engine.groupings.reset();
      props.engine.pipeline.reset();
    }
  }, [props.engine, disableResetControls]);

  const isExecuting = status === PipelineStatusEnum.Executing;

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
                  <MenuItem
                    disabled={disableResetControls}
                    onClick={resetToSystemDefaults}
                  >
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

export default React.memo(ExplorerBar);
