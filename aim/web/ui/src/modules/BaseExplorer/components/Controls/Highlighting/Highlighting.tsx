import * as React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import ControlPopover from 'components/ControlPopover';
import ErrorBoundary from 'components/ErrorBoundary';

import HighlightingPopover from './Popover';

import { IHighlightingProps, IHighlightingConfig } from './index';

function Highlighting(props: IHighlightingProps) {
  const {
    engine,
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const highlighting: IHighlightingConfig = useStore(
    vizEngine.controls.highlighting.stateSelector,
  );
  return (
    <ErrorBoundary>
      <ControlPopover
        title='Highlight modes'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip title='Highlight modes'>
            <div>
              <Button
                size='xSmall'
                onClick={onAnchorClick}
                className={classNames('Control__anchor', {
                  active: opened || !highlighting.isInitial,
                  outlined: !opened && !highlighting.isInitial,
                })}
              >
                <Icon
                  name='highlight-mode'
                  className={classNames('Control__anchor__icon', {
                    active: opened || !highlighting.isInitial,
                  })}
                />
                <Text className='Control__anchor__label'>Highlighting</Text>
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
          <HighlightingPopover
            engine={engine}
            visualizationName={visualizationName}
          />
        }
      />
    </ErrorBoundary>
  );
}

Highlighting.displayName = 'Highlighting';

export default React.memo(Highlighting);
