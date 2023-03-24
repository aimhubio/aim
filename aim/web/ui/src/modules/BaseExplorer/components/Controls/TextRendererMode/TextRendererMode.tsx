import React from 'react';
import classNames from 'classnames';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Icon, Button, Text } from 'components/kit';

import TextRendererModePopover from './Popover';

import { ITextRendererModeProps } from '.';

function TextRendererMode(props: ITextRendererModeProps) {
  const {
    engine,
    engine: { useStore },
    visualizationName,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];
  const controls = vizEngine.controls;
  const textRenderer = useStore(controls.textRenderer.stateSelector);
  const updateTextRnderer = vizEngine.controls.textRenderer.methods.update;

  return (
    <ControlPopover
      title='Switch renderer'
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      anchor={({ onAnchorClick, opened }) => (
        <Button
          size='xSmall'
          onClick={onAnchorClick}
          className={classNames('Control__anchor', {
            active: opened || !textRenderer.isInitial,
            outlined: !opened && !textRenderer.isInitial,
          })}
        >
          <Icon
            name='text'
            className={classNames('Control__anchor__icon', {
              active: opened || !textRenderer.isInitial,
            })}
          />
          <Text className='Control__anchor__label'>Text Renderer</Text>
          <Icon
            name='arrow-down-contained'
            className={classNames('Control__anchor__arrow', { opened })}
            fontSize={6}
          />
        </Button>
      )}
      component={
        <TextRendererModePopover
          update={updateTextRnderer}
          textRenderer={textRenderer}
        />
      }
    />
  );
}

TextRendererMode.displayName = 'TextRendererMode';

export default React.memo<ITextRendererModeProps>(TextRendererMode);
