import React from 'react';
import classNames from 'classnames';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Icon, Button, Text } from 'components/kit';

import BoxPropertiesPopover from './Popover';

import { IBoxPropertiesProps, IBoxConfigState } from '.';

function BoxProperties(props: IBoxPropertiesProps) {
  const {
    visualizationName,
    engine: { visualizations, useStore },
  } = props;
  const vizEngine = visualizations[visualizationName];

  const boxProperties: IBoxConfigState = useStore(vizEngine.box.stateSelector);
  return (
    <ControlPopover
      title='Configure box size'
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      anchor={({ onAnchorClick, opened }) => (
        <Button
          size='xSmall'
          onClick={onAnchorClick}
          className={classNames('Control__anchor', {
            active: opened || !boxProperties.isInitial,
            outlined: !opened && !boxProperties.isInitial,
          })}
        >
          <Icon
            name='box-settings'
            className={classNames('Control__anchor__icon', {
              active: opened || !boxProperties.isInitial,
            })}
          />
          <Text className='Control__anchor__label'>Box size</Text>
          <Icon
            name='arrow-down-contained'
            className={classNames('Control__anchor__arrow', { opened })}
            fontSize={6}
          />
        </Button>
      )}
      component={
        <BoxPropertiesPopover
          update={vizEngine.box.methods.update}
          reset={vizEngine.box.methods.reset}
          boxProperties={boxProperties}
          settings={vizEngine.controls.boxProperties.settings}
        />
      }
    />
  );
}

BoxProperties.displayName = 'BoxProperties';

export default React.memo<IBoxPropertiesProps>(BoxProperties);
