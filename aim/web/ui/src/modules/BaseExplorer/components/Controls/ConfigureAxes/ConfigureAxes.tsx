import * as React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';
import ControlPopover from 'components/ControlPopover';
import { Icon, Text } from 'components/kit';

import ConfigureAxesPopover from './Popover';

import { IConfigureAxesProps } from './index';

function ConfigureAxes(props: IConfigureAxesProps) {
  const {
    engine,
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const axesProps = useStore(vizEngine.controls.axesProperties.stateSelector);
  return (
    <ErrorBoundary>
      <ControlPopover
        title='Configure axes properties'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip title='Axes properties'>
            <div
              className={classNames('Control__anchor', {
                active: !axesProps.isInitial,
                outlined: !axesProps.isInitial,
              })}
              onClick={onAnchorClick}
            >
              <Icon
                name='axes-props'
                className={classNames('Control__anchor__icon', {
                  active: !axesProps.isInitial,
                })}
              />
              <Text className='Control__anchor__label'>Configure axes</Text>
              <Icon
                name='arrow-down-contained'
                className={classNames('Control__anchor__arrow', { opened })}
                fontSize={6}
              />
            </div>
          </Tooltip>
        )}
        component={
          <ConfigureAxesPopover
            engine={engine}
            visualizationName={visualizationName}
          />
        }
      />
    </ErrorBoundary>
  );
}

ConfigureAxes.displayName = 'ConfigureAxes';

export default React.memo(ConfigureAxes);
