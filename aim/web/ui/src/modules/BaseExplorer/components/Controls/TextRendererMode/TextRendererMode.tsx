import React from 'react';
import classNames from 'classnames';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Icon, Button, Text } from 'components/kit';

import TextRendererModePopover from './Popover';

import { ITextRendererModeProps, ITextRendererModeState } from '.';

function TextRendererMode(props: ITextRendererModeProps) {
  const {
    engine: { visualizations, useStore },
  } = props;

  console.log(props);

  // const boxProperties: ITextRendererModeState = useStore(vizEngine.box.stateSelector);
  return (
    <ControlPopover
      title='Switch renderer'
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      anchor={({ onAnchorClick, opened }) => (
        <Button
          size='xSmall'
          onClick={onAnchorClick}
          className={classNames('Control__anchor', {
            active: opened,
            outlined: !opened,
          })}
        >
          <Icon
            name='text'
            className={classNames('Control__anchor__icon', {
              active: opened,
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
        () => null
        // <TextRendererModePopover
        //   update={vizEngine.box.methods.update}
        //   reset={vizEngine.box.methods.reset}
        //   textRenderer={null}
        // />
      }
    />
  );
}

TextRendererMode.displayName = 'TextRendererMode';

export default React.memo<ITextRendererModeProps>(TextRendererMode);
