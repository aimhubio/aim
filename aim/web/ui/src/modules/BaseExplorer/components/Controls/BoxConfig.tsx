import React, { ChangeEvent } from 'react';

import { Divider, Tooltip } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Icon, Slider, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IBaseComponentProps } from '../../types';

import '../../../../components/ImagePropertiesPopover/ImagePropertiesPopover.scss';

type BoxConfigState = {
  isInitial: boolean;
  width: number;
  height: number;
  gap: number;
};

function BoxConfig(props: IBaseComponentProps) {
  const boxConfig: BoxConfigState = props.engine.useStore(
    props.engine.boxConfig.stateSelector,
  );

  const updateBoxConfig = React.useCallback(
    ({
      width = boxConfig.width,
      height = boxConfig.height,
      gap = boxConfig.gap,
    }: any) => {
      // maybe throttle this to avoid performance issues
      props.engine.boxConfig.methods.update({
        width,
        height,
        gap,
      });
    },
    [boxConfig, props.engine],
  );

  function updateBoxConfigWidth(e: ChangeEvent<{}>, width: number) {
    updateBoxConfig({ width });
  }

  function updateBoxConfigHeight(e: ChangeEvent<{}>, height: number) {
    updateBoxConfig({ height });
  }
  function updateBoxConfigGap(e: ChangeEvent<{}>, gap: number) {
    updateBoxConfig({ gap });
  }

  return (
    <ControlPopover
      title='Box properties'
      anchor={({ onAnchorClick, opened }) => (
        <Tooltip title='Box properties'>
          <div
            onClick={onAnchorClick}
            className={`Controls__anchor ${
              opened ? 'active outlined' : !boxConfig.isInitial ? 'active' : ''
            }`}
          >
            <Icon
              className={`Controls__icon ${opened || false ? 'active' : ''}`}
              name='image-properties'
            />
          </div>
        </Tooltip>
      )}
      component={
        <ErrorBoundary>
          <div className={'ImagePropertiesPopover'}>
            <div className='ImagePropertiesPopover__section'>
              <div className='ImagePropertiesPopover__sizeSlider'>
                <div className='flex'>
                  <Text
                    tint={50}
                    component='h4'
                    className='ImagePropertiesPopover__subtitle ImagePropertiesPopover__subtitle__windowSize'
                  >
                    Width:
                  </Text>
                  <Text className='ImagePropertiesPopover__sizePercent'>
                    {boxConfig.width}px
                  </Text>
                </div>
                <div className='ImagePropertiesPopover__Slider'>
                  <Text>{20}px</Text>
                  <Slider
                    valueLabelDisplay='auto'
                    getAriaValueText={(val) => `${val}`}
                    value={boxConfig.width}
                    onChange={updateBoxConfigWidth as any}
                    step={10}
                    max={600}
                    min={20}
                  />
                  <Text>{600}px</Text>
                </div>
                <Divider className='ImagePropertiesPopover__Divider' />

                <div className='flex'>
                  <Text
                    tint={50}
                    component='h4'
                    className='ImagePropertiesPopover__subtitle ImagePropertiesPopover__subtitle__windowSize'
                  >
                    Height:
                  </Text>
                  <Text className='ImagePropertiesPopover__sizePercent'>
                    {boxConfig.height}px
                  </Text>
                </div>
                <div className='ImagePropertiesPopover__Slider'>
                  <Text>{20}px</Text>
                  <Slider
                    valueLabelDisplay='auto'
                    getAriaValueText={(val) => `${val}`}
                    value={boxConfig.height}
                    onChange={updateBoxConfigHeight as any}
                    step={10}
                    max={600}
                    min={20}
                  />
                  <Text>{600}px</Text>
                </div>
                <Divider className='ImagePropertiesPopover__Divider' />

                <div className='flex'>
                  <Text
                    tint={50}
                    component='h4'
                    className='ImagePropertiesPopover__subtitle ImagePropertiesPopover__subtitle__windowSize'
                  >
                    Gap:
                  </Text>
                  <Text className='ImagePropertiesPopover__sizePercent'>
                    {boxConfig.gap}px
                  </Text>
                </div>
                <div className='ImagePropertiesPopover__Slider'>
                  <Text>{10}px</Text>
                  <Slider
                    valueLabelDisplay='auto'
                    getAriaValueText={(val) => `${val}`}
                    value={boxConfig.gap}
                    onChange={updateBoxConfigGap as any}
                    step={5}
                    min={0}
                    max={50}
                  />
                  <Text>{50}px</Text>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      }
      /*<div className={'ImagePropertiesPopover'}>
          <div className='ImagePropertiesPopover__section'>
            <Text
              tint={50}
              component='h4'
              className='ImagePropertiesPopover__subtitle'
            >
              Width:
            </Text>
            <div className='ImagePropertiesPopover__Slider'>
              <Text>{20}px</Text>

              <Slider
                valueLabelDisplay='auto'
                getAriaValueText={(val) => `${val}`}
                value={10}
                disabled={true}
                onChange={() => {}}
                step={10}
                max={20}
                min={500}
              />
              <div className='ImagePropertiesPopover__sizeSlider'>
                <div className='ImagePropertiesPopover__Slider'>
                  <Text>{500}px</Text>
                </div>
              </div>
              <div className='ImagePropertiesPopover__Slider'>
                <div className='ImagePropertiesPopover__section__mediaItemSize'>
                  <Text
                    tint={50}
                    component='h4'
                    className='ImagePropertiesPopover__subtitle'
                  >
                    Height:
                  </Text>
                </div>
                <Text>{20}px</Text>
                <Slider
                  valueLabelDisplay='auto'
                  getAriaValueText={(val) => `${val}`}
                  value={10}
                  disabled={true}
                  onChange={() => {}}
                  step={10}
                  max={20}
                  min={500}
                />
                <Text>{500}px</Text>
              </div>
              <div className='ImagePropertiesPopover__Slider'>
                <div className='ImagePropertiesPopover__section__mediaItemSize'>
                  <Text
                    tint={50}
                    component='h4'
                    className='ImagePropertiesPopover__subtitle'
                  >
                    Gap:
                  </Text>
                </div>
                <Text>{0}px</Text>
                <Slider
                  valueLabelDisplay='auto'
                  getAriaValueText={(val) => `${val}`}
                  value={10}
                  disabled={true}
                  onChange={() => {}}
                  step={5}
                  max={0}
                  min={100}
                />
                <Text>{100}px</Text>
              </div>
            </div>
          </div>
        </div>
      }*/
    />
  );
}

export default React.memo<IBaseComponentProps>(BoxConfig);
