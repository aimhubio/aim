import * as React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';
import ControlPopover from 'components/ControlPopover';
import { Button, Icon, Text } from 'components/kit';

import SmoothingPopover from './Popover';

import { ISmoothingProps } from './';

function Smoothing(props: ISmoothingProps) {
  const {
    engine,
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const smoothing = useStore(vizEngine.controls.smoothing.stateSelector);
  return (
    <ErrorBoundary>
      <ControlPopover
        title='Chart smoothing options'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip
            title={
              smoothing.isApplied ? 'Disable smoothing' : 'Apply smoothing'
            }
          >
            <div>
              <Button
                size='xSmall'
                onClick={onAnchorClick}
                className={classNames('Control__anchor', {
                  active: opened || !smoothing.isInitial,
                  outlined: !opened && !smoothing.isInitial,
                })}
              >
                <Icon
                  name='smoothing'
                  className={classNames('Control__anchor__icon', {
                    active: opened || !smoothing.isInitial,
                  })}
                />
                <Text className='Control__anchor__label'>Smoothing</Text>
                <Icon
                  name='arrow-down-contained'
                  className={classNames('Control__anchor__arrow', { opened })}
                  fontSize={6}
                />
              </Button>
            </div>
          </Tooltip>
        )}
        component={
          <SmoothingPopover
            engine={engine}
            visualizationName={visualizationName}
          />
        }
      />
    </ErrorBoundary>
  );
}

Smoothing.displayName = 'Smoothing';

export default React.memo(Smoothing);
