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
  const boxConfig: IBoxConfigState = useStore(boxSelector);
  return (
    <ControlPopover
      title='Box properties'
      anchor={({ onAnchorClick, opened }) => (
        <Tooltip title='Box properties'>
          <div
            onClick={onAnchorClick}
            className={classNames('Controls__anchor', {
              active: opened || !boxConfig.isInitial,
              outlined: !opened && !boxConfig.isInitial,
            })}
          >
            <Icon
              className={classNames('Controls__icon', {
                active: opened || !boxConfig.isInitial,
              })}
              name='image-properties'
            />
          </div>
        </Tooltip>
      )}
      component={
        <BoxPropertiesPopover
          engine={engine}
          boxConfig={boxConfig}
          settings={settings}
        />
      }
    />
  );
}

BoxProperties.displayName = 'BoxProperties';

export default React.memo<IBaseComponentProps>(BoxProperties);
