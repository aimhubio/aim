import React from 'react';
import classNames from 'classnames';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon, Text } from 'components/kit';

import BoxPropertiesPopover from './Popover';

import { IBoxPropertiesProps, IBoxConfigState } from '.';

function BoxProperties(props: IBoxPropertiesProps) {
  const {
    engine,
    engine: {
      useStore,
      boxConfig: { stateSelector: boxSelector },
      controls: {
        boxProperties: { settings },
      },
    },
  } = props;
  const boxProperties: IBoxConfigState = useStore(boxSelector);
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
          update={engine.boxConfig.methods.update}
          reset={engine.boxConfig.methods.reset}
          boxProperties={boxProperties}
          settings={settings}
        />
      }
    />
  );
}

BoxProperties.displayName = 'BoxProperties';

export default React.memo<IBaseComponentProps>(BoxProperties);
