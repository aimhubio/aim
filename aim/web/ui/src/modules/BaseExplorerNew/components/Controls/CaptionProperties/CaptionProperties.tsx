import React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';
import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import CaptionPropertiesPopover from './CaptionPropertiesPopover';

import { ICaptionProperties, ICaptionPropertiesProps } from './';

function CaptionProperties(props: ICaptionPropertiesProps) {
  const {
    engine,
    engine: {
      useStore,
      controls: {
        captionProperties: { stateSelector },
      },
    },
  } = props;
  const captionProperties: ICaptionProperties = useStore(stateSelector);
  return (
    <ErrorBoundary>
      <ControlPopover
        title='Configure box caption'
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip title='Configure box caption'>
            <div
              onClick={onAnchorClick}
              className={classNames('Controls__anchor', {
                active: opened || !captionProperties.isInitial,
                outlined: !captionProperties.isInitial,
              })}
            >
              <Icon
                className={classNames('Controls__icon', {
                  active: opened || !captionProperties.isInitial,
                })}
                name='info-circle-outline'
              />
            </div>
          </Tooltip>
        )}
        component={
          <CaptionPropertiesPopover
            engine={engine}
            captionProperties={captionProperties}
          />
        }
      />
    </ErrorBoundary>
  );
}

CaptionProperties.displayName = 'CaptionProperties';

export default React.memo<IBaseComponentProps>(CaptionProperties);
