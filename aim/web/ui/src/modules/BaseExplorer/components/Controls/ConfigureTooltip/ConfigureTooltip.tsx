import * as React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';
import ControlPopover from 'components/ControlPopover';
import { Icon, Text } from 'components/kit';

import ConfigureTooltipPopover from './Popover';

import { IConfigureTooltipProps, ITooltipConfig } from './index';

function ConfigureTooltip(props: IConfigureTooltipProps) {
  const {
    engine,
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const tooltip: ITooltipConfig = useStore(
    vizEngine.controls.tooltip.stateSelector,
  );
  return (
    <ErrorBoundary>
      <ControlPopover
        title='Display in tooltip'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip title='Tooltip fields'>
            <div
              className={classNames('Control__anchor', {
                active: !tooltip.isInitial,
                outlined: !tooltip.isInitial,
              })}
              onClick={onAnchorClick}
            >
              <Icon
                name='cursor'
                className={classNames('Control__anchor__icon', {
                  active: !tooltip.isInitial,
                })}
              />
              <Text className='Control__anchor__label'>Configure tooltip</Text>
              <Icon
                name='arrow-down-contained'
                className={classNames('Control__anchor__arrow', { opened })}
                fontSize={6}
              />
            </div>
          </Tooltip>
        )}
        component={
          <ConfigureTooltipPopover
            engine={engine}
            visualizationName={visualizationName}
          />
        }
      />
    </ErrorBoundary>
  );
}

ConfigureTooltip.displayName = 'ConfigureTooltip';

export default React.memo(ConfigureTooltip);
