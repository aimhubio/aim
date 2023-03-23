import * as React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';
import ControlPopover from 'components/ControlPopover';
import { Button, Icon } from 'components/kit';

import { ZoomInPopover, ZoomOutPopover } from './Popover';

import { IZoomProps, IZoomConfig } from './index';

function Zoom(props: IZoomProps) {
  const {
    engine,
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const zoom: IZoomConfig = useStore(vizEngine.controls.zoom.stateSelector);
  const updateZoomConfig = vizEngine.controls.zoom.methods.update;
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <ErrorBoundary>
        <ControlPopover
          title='Select zoom mode'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Zoom in'>
              <div>
                <Button
                  size='xSmall'
                  className={classNames('Control__anchor', {
                    active: opened || zoom.active,
                    outlined: !opened && zoom.active,
                  })}
                  onClick={() => {
                    updateZoomConfig({ active: !zoom?.active });
                  }}
                >
                  <Icon
                    name='zoom-in'
                    className={classNames('Control__anchor__icon', {
                      active: opened || zoom.active,
                    })}
                  />
                  {/* TODO: commented out yet, experimental */}
                  {/*<Text className='Control__anchor__label'>Zoom in</Text>*/}
                  <Icon
                    name='arrow-down-contained'
                    className={classNames('Control__anchor__arrow', { opened })}
                    fontSize={6}
                    onClick={onAnchorClick}
                  />
                </Button>
              </div>
            </Tooltip>
          )}
          component={
            <ZoomInPopover
              engine={engine}
              visualizationName={visualizationName}
            />
          }
        />
      </ErrorBoundary>
      <ErrorBoundary>
        <ControlPopover
          title='Select option to zoom out'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Zoom out'>
              <div>
                <Button
                  size='xSmall'
                  onClick={() => {
                    if (zoom.history.length) {
                      updateZoomConfig({
                        history: [...zoom.history].slice(0, -1),
                      });
                    }
                  }}
                  className={classNames('Control__anchor', {
                    active: opened,
                    outlined: !opened,
                    disabled: !zoom.history.length,
                  })}
                >
                  <Icon
                    name='zoom-out'
                    className={classNames('Control__anchor__icon', {
                      active: opened || zoom.active,
                    })}
                  />
                  {/* TODO: commented out yet, experimental */}
                  {/*<Text className='Control__anchor__label'>Zoom out</Text>*/}
                  <Icon
                    name='arrow-down-contained'
                    className={classNames('Control__anchor__arrow', {
                      opened,
                      disabled: !zoom.history.length,
                    })}
                    onClick={onAnchorClick}
                    fontSize={6}
                  />
                </Button>
              </div>
            </Tooltip>
          )}
          component={
            <ZoomOutPopover
              engine={engine}
              visualizationName={visualizationName}
            />
          }
        />
      </ErrorBoundary>
    </div>
  );
}

Zoom.displayName = 'Zoom';

export default React.memo(Zoom);
