import React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';
import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Icon } from 'components/kit';

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
      title='Box properties'
      anchor={({ onAnchorClick, opened }) => (
        <Tooltip title='Box properties'>
          <div
            onClick={onAnchorClick}
            className={classNames('Controls__anchor', {
              active: opened || !boxProperties.isInitial,
              outlined: !opened && !boxProperties.isInitial,
            })}
          >
            <Icon
              className={classNames('Controls__icon', {
                active: opened || !boxProperties.isInitial,
              })}
              name='box-settings'
            />
          </div>
        </Tooltip>
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
