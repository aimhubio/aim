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
  const title = 'Box size';
  return (
    <ControlPopover
      title={title}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      anchor={({ onAnchorClick, opened }) => (
        <Button
          title={title}
          size='xSmall'
          onClick={onAnchorClick}
          className={classNames('Control__anchor', {
            active: opened || !boxProperties.isInitial,
            outlined: !opened && !boxProperties.isInitial,
          })}
        >
          <Icon
            className={classNames('Control__icon', {
              active: opened || !boxProperties.isInitial,
            })}
            name='box-settings'
          />
          <Text className='Control__text'>{title}</Text>
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
