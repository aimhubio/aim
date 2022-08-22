import React, { ChangeEvent } from 'react';
import _ from 'lodash-es';

import { Divider } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Button, Slider, Text } from 'components/kit';

import { IBoxConfigState } from '..';

import { IBoxPropertiesPopoverProps } from '.';

import './BoxPropertiesPopover.scss';

function BoxPropertiesPopover(props: IBoxPropertiesPopoverProps) {
  const { reset, update, boxProperties, settings, updateDelay = 100 } = props;
  const [boxProps, setBoxProps] = React.useState({
    width: 0,
    height: 0,
    gap: 0,
  });

  const debouncedBoxPropsUpdate = _.debounce(
    (boxProps: Partial<IBoxConfigState>) => {
      update?.(boxProps);
    },
    updateDelay,
  );

  const updateBoxProps = React.useCallback(
    ({
      width = boxProperties.width,
      height = boxProperties.height,
      gap = boxProperties.gap,
    }: Partial<IBoxConfigState>) => {
      debouncedBoxPropsUpdate({
        width,
        height,
        gap,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boxProperties, update],
  );
  const onBoxWidthChange = React.useCallback(
    (e: ChangeEvent<{}>, width: number | number[]) => {
      setBoxProps((state) => ({ ...state, width: width as number }));
      updateBoxProps({ width: width as number });
    },
    [setBoxProps, updateBoxProps],
  );
  const onBoxHeightChange = React.useCallback(
    (e: ChangeEvent<{}>, height: number | number[]) => {
      setBoxProps((state) => ({ ...state, height: height as number }));
      updateBoxProps({ height: height as number });
    },
    [setBoxProps, updateBoxProps],
  );

  const onReset = React.useCallback(() => {
    const disabled = boxProperties.isInitial;
    if (!disabled && reset) {
      reset();
    }
  }, [boxProperties.isInitial, reset]);

  React.useEffect(() => {
    setBoxProps((state) =>
      _.isEqual(boxProperties, state) ? state : boxProperties,
    );
  }, [boxProperties, setBoxProps]);

  return (
    <ErrorBoundary>
      <div className='BoxPropsPopover'>
        <div className='BoxPropsPopover__section'>
          <div className='BoxPropsPopover__item'>
            <div className='flex'>
              <Text
                tint={50}
                component='h4'
                className='BoxPropsPopover__subtitle'
              >
                Width:
              </Text>
              <Text className='BoxPropsPopover__sizePercent' weight={600}>
                {boxProps.width}px
              </Text>
            </div>
            <div className='BoxPropsPopover__SliderWrapper'>
              <Text>{settings.minWidth}px</Text>
              <Slider
                valueLabelDisplay='auto'
                getAriaValueText={(val) => `${val}`}
                value={boxProps.width}
                onChange={onBoxWidthChange}
                step={settings.step}
                min={settings.minWidth}
                max={settings.maxWidth}
              />
              <Text>{settings.maxWidth}px</Text>
            </div>
          </div>
          <Divider className='BoxPropsPopover__Divider' />
          <div className='BoxPropsPopover__item'>
            <div className='flex'>
              <Text
                tint={50}
                component='h4'
                className='BoxPropsPopover__subtitle'
              >
                Height:
              </Text>
              <Text className='BoxPropsPopover__sizePercent' weight={600}>
                {boxProps.height}px
              </Text>
            </div>
            <div className='BoxPropsPopover__SliderWrapper'>
              <Text>{settings.minHeight}px</Text>
              <Slider
                valueLabelDisplay='auto'
                getAriaValueText={(val) => `${val}`}
                value={boxProps.height}
                onChange={onBoxHeightChange}
                step={settings.step}
                min={settings.minHeight}
                max={settings.maxHeight}
              />
              <Text>{settings.maxHeight}px</Text>
            </div>
          </div>
          <Divider className='BoxPropsPopover__Divider' />
          <Button onClick={onReset} disabled={boxProperties.isInitial}>
            Reset
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
}

BoxPropertiesPopover.displayName = 'BoxPropertiesPopup';

export default React.memo<IBoxPropertiesPopoverProps>(BoxPropertiesPopover);
