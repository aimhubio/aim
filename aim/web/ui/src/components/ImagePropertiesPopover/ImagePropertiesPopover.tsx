import React from 'react';

import { Divider } from '@material-ui/core';

import { Dropdown, Slider, Text, ToggleButton } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import {
  MediaItemAlignmentEnum,
  ImageRenderingEnum,
} from 'config/enums/imageEnums';
import {
  IMAGES_SLIDER_PROPS,
  IMAGE_ALIGNMENT_OPTIONS,
} from 'config/mediaConfigs/mediaConfigs';

import { IImagePropertiesPopoverProps } from './ImagePropertiesPopover.d';

import './ImagePropertiesPopover.scss';

function ImagePropertiesPopover({
  additionalProperties,
  onImageSizeChange,
  onImageRenderingChange,
  onImageAlignmentChange,
}: IImagePropertiesPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const [open, setOpen] = React.useState<boolean>(false);
  const [sizeValue, setSizeValue] = React.useState<number>(
    additionalProperties.mediaItemSize,
  );

  function onSizeValueChange(
    event: React.ChangeEvent<{}>,
    newValue: number | number[],
  ): void & React.FormEventHandler<HTMLSpanElement> {
    onImageSizeChange(newValue as number);
    setSizeValue(newValue as number);
  }

  const isOriginalAlignment: boolean = React.useMemo((): boolean => {
    return (
      additionalProperties.alignmentType === MediaItemAlignmentEnum.Original
    );
  }, [additionalProperties.alignmentType]);

  return (
    <ErrorBoundary>
      <div className={'ImagePropertiesPopover'}>
        <div className='ImagePropertiesPopover__section'>
          <div className='ImagePropertiesPopover__section__mediaItemSize'>
            <Text
              tint={50}
              component='h4'
              className='ImagePropertiesPopover__subtitle'
            >
              Align Images by:
            </Text>
          </div>
          <div>
            <Dropdown
              size='large'
              isColored
              onChange={onImageAlignmentChange}
              value={additionalProperties.alignmentType}
              options={IMAGE_ALIGNMENT_OPTIONS}
              onMenuOpen={() => setOpen(true)}
              onMenuClose={() => setOpen(false)}
              open={open}
              withPortal
            />
          </div>
          <div
            className={`ImagePropertiesPopover__sizeSlider ${
              isOriginalAlignment
                ? 'ImagePropertiesPopover__sizeSlider--disabled'
                : ''
            } `}
          >
            <div className='flex'>
              <Text
                tint={50}
                component='h4'
                className='ImagePropertiesPopover__subtitle ImagePropertiesPopover__subtitle__windowSize'
              >
                Scale (Relative to window size):
              </Text>
              <Text className='ImagePropertiesPopover__sizePercent'>
                {`${sizeValue}%`}
              </Text>
            </div>
            <div className='ImagePropertiesPopover__Slider'>
              <Text>{IMAGES_SLIDER_PROPS.min}%</Text>
              <Slider
                valueLabelDisplay='auto'
                getAriaValueText={(val) => `${val}`}
                value={sizeValue}
                disabled={isOriginalAlignment}
                onChange={onSizeValueChange as any}
                step={IMAGES_SLIDER_PROPS.step}
                max={IMAGES_SLIDER_PROPS.max}
                min={IMAGES_SLIDER_PROPS.min}
              />
              <Text>{IMAGES_SLIDER_PROPS.max}%</Text>
            </div>
          </div>
        </div>
        <Divider className='ImagePropertiesPopover__Divider' />
        <div className='ImagePropertiesPopover__section'>
          <Text
            component='h4'
            tint={50}
            className='ImagePropertiesPopover__subtitle ImagePropertiesPopover__subtitle__imageRendering'
          >
            Image Rendering
          </Text>
          <ToggleButton
            className='ImagePropertiesPopover__ToggleButton'
            title='Optimization'
            onChange={onImageRenderingChange}
            rightLabel='Smoother'
            leftLabel='Pixelated'
            leftValue={ImageRenderingEnum.Pixelated}
            rightValue={ImageRenderingEnum.Smooth}
            value={additionalProperties.imageRendering}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

ImagePropertiesPopover.displayName = 'ImagePropertiesPopover';

export default React.memo<IImagePropertiesPopoverProps>(ImagePropertiesPopover);
