import * as React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';
import { Button, Icon, Text } from 'components/kit';

import { ILegendsProps } from './index';

function Legends(props: ILegendsProps) {
  const {
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const legends = useStore(vizEngine.controls.legends.stateSelector);
  const updateLegends = vizEngine.controls.legends.methods.update;

  return (
    <ErrorBoundary>
      <Tooltip title={legends.display ? 'Hide legends' : 'Display legends'}>
        <div>
          <Button
            size='xSmall'
            className={classNames('Control__anchor', {
              active: legends.display,
              outlined: legends.isInitial,
            })}
            onClick={() => updateLegends({ display: !legends.display })}
          >
            <Icon
              name='chart-legends'
              className={classNames('Control__anchor__icon', {
                active: legends.display,
              })}
            />
            <Text className='Control__anchor__label'>Legends</Text>
          </Button>
        </div>
      </Tooltip>
    </ErrorBoundary>
  );
}

Legends.displayName = 'Legends';

export default React.memo(Legends);
