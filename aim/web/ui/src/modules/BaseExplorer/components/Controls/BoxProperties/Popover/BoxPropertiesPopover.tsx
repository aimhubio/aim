import React, { ChangeEvent } from 'react';
import _ from 'lodash-es';

import { Divider } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Button, Slider, Text } from 'components/kit';

import { IBoxConfigState } from '..';

import { IBoxPropertiesPopoverProps } from '.';

import './styles.scss';

function BoxPropertiesPopover(props: IBoxPropertiesPopoverProps) {
  const { engine, boxConfig, settings, updateDelay = 150 } = props;
  const [boxProps, setBoxProps] = React.useState({
    width: 0,
    height: 0,
    gap: 0,
  });

  const debouncedBoxConfigUpdate = _.debounce(
    (config: Partial<IBoxConfigState>) => {
      engine.boxConfig.methods.update(config);
    },
    updateDelay,
  );

  const updateBoxConfig = React.useCallback(
    ({
      width = boxConfig.width,
      height = boxConfig.height,
      gap = boxConfig.gap,
    }: Partial<IBoxConfigState>) => {
      debouncedBoxConfigUpdate({
        width,
        height,
        gap,
      });
    },
    [boxConfig, engine],
  );
  const onBoxWidthChange = React.useCallback(
    (e: ChangeEvent<{}>, width: number | number[]) => {
      setBoxProps((state) => ({ ...state, width: width as number }));
      updateBoxConfig({ width: width as number });
    },
    [setBoxProps, updateBoxConfig],
  );
  const onBoxHeightChange = React.useCallback(
    (e: ChangeEvent<{}>, height: number | number[]) => {
      setBoxProps((state) => ({ ...state, height: height as number }));
      updateBoxConfig({ height: height as number });
    },
    [setBoxProps, updateBoxConfig],
  );
  const onBoxGapChange = React.useCallback(
    (e: ChangeEvent<{}>, gap: number | number[]) => {
      setBoxProps((state) => ({ ...state, gap: gap as number }));
      updateBoxConfig({ gap: gap as number });
    },
    [setBoxProps, updateBoxConfig],
  );

  const onReset = React.useCallback(() => {
    const disabled = boxConfig.isInitial;
    if (!disabled) {
      engine.boxConfig.methods.reset();
    }
  }, [boxConfig.isInitial]);

  React.useEffect(() => {
    setBoxProps((state) => (_.isEqual(boxConfig, state) ? state : boxConfig));
  }, [boxConfig, setBoxProps]);

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
            <div className='BoxPropsPopover__Slider'>
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
            <div className='BoxPropsPopover__Slider'>
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
          <div className='BoxPropsPopover__item'>
            <div className='flex'>
              <Text
                className='BoxPropsPopover__subtitle'
                tint={50}
                component='h4'
              >
                Gap:
              </Text>
              <Text className='BoxPropsPopover__sizePercent' weight={600}>
                {boxProps.gap}px
              </Text>
            </div>
            <div className='BoxPropsPopover__Slider'>
              <Text>{settings.minGap}px</Text>
              <Slider
                valueLabelDisplay='auto'
                getAriaValueText={(val) => `${val}`}
                value={boxProps.gap}
                onChange={onBoxGapChange}
                step={settings.step}
                min={settings.minGap}
                max={settings.maxGap}
              />
              <Text>{settings.maxGap}px</Text>
            </div>
          </div>
          <Divider className='BoxPropsPopover__Divider' />
          <Button onClick={onReset} disabled={boxConfig.isInitial}>
            Reset
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
}

BoxPropertiesPopover.displayName = 'BoxPropertiesPopup';

export default React.memo<IBoxPropertiesPopoverProps>(BoxPropertiesPopover);
