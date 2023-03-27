import * as React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';
import { IconCode } from '@tabler/icons-react';
import Editor from '@monaco-editor/react';

import ErrorBoundary from 'components/ErrorBoundary';
import ControlPopover from 'components/ControlPopover';
import { Button, Icon, Text } from 'components/kit';

import { ICustomWidgetControlProps } from './index';

function CustomWidgetControl(props: ICustomWidgetControlProps) {
  const {
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const customWidget = useStore(vizEngine.controls.customWidget.stateSelector);
  const updateCustomWidget = vizEngine.controls.customWidget.methods.update;

  return (
    <ErrorBoundary>
      <ControlPopover
        title='Code for custom widget'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip
            title={customWidget.display ? 'Hide widget' : 'Display widget'}
          >
            <div>
              <Button
                size='xSmall'
                className={classNames('Control__anchor', {
                  active: customWidget.display,
                  outlined: !customWidget.isInitial,
                })}
                onClick={() =>
                  updateCustomWidget({ display: !customWidget.display })
                }
              >
                <IconCode
                  size={16}
                  className={classNames('Control__anchor__icon', {
                    active: customWidget.display,
                  })}
                />
                <Text className='Control__anchor__label'>Widget</Text>
                <Icon
                  name='arrow-down-contained'
                  className={classNames('Control__anchor__arrow', { opened })}
                  onClick={onAnchorClick}
                  fontSize={6}
                />
              </Button>
            </div>
          </Tooltip>
        )}
        component={() => {
          return (
            <div style={{ width: 400, height: 200 }}>
              <Editor
                language='python'
                height='100%'
                value={customWidget.code}
                onChange={(v) => updateCustomWidget({ code: v! })}
                loading={<span />}
                options={{
                  tabSize: 4,
                  useTabStops: true,
                }}
              />
            </div>
          );
        }}
      />
    </ErrorBoundary>
  );
}

CustomWidgetControl.displayName = 'CustomWidgetControl';

export default React.memo(CustomWidgetControl);
