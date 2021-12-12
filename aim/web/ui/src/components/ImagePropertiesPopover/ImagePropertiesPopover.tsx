import React from 'react';

import { Divider } from '@material-ui/core';

import { Slider, Text, ToggleButton } from 'components/kit';

import {
  // MediaItemAlignmentEnum,
  ImageRenderingEnum,
} from 'config/enums/imageEnums';

import { IImagePropertiesPopoverProps } from './ImagePropertiesPopover.d';

import './ImagePropertiesPopover.scss';

const sizeProps = {
  step: 1,
  min: 15,
  max: 70,
};

//TODO Implement images alignment options

// const alignmentOptions = [
//   { label: 'Original', value: MediaItemAlignmentEnum.Original },
//   { label: 'Align By Width', value: MediaItemAlignmentEnum.Width },
//   { label: 'Align By Height', value: MediaItemAlignmentEnum.Height },
// ];

function ImagePropertiesPopover({
  additionalProperties,
  onImageSizeChange,
  onImageRenderingChange,
}: // onImageAlignmentChange,
IImagePropertiesPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  // const [open, setOpen] = React.useState<boolean>(false);
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
  return (
    <div className={'ImagePropertiesPopover'}>
      <div className='ImagePropertiesPopover__section'>
        <div className='ImagePropertiesPopover__section__mediaItemSize'>
          <Text
            tint={50}
            component='h4'
            className='ImagePropertiesPopover__subtitle'
          >
            Image Size:
          </Text>
          <Text className='ImagePropertiesPopover__sizePercent'>
            {additionalProperties.mediaItemSize}%
          </Text>
        </div>
        {/* <div>
          <Dropdown
            size='large'
            isColored
            onChange={onImageAlignmentChange}
            value={manipulations.alignmentType}
            options={alignmentOptions}
            onMenuOpen={() => setOpen(true)}
            onMenuClose={() => setOpen(false)}
            open={open}
            withPortal
          />
        </div> */}
        {/* <div className='flex fac ImageManipulationsPopover__sizeSlider'>
          <Text
            tint={50}
            component='h4'
            className='ImageManipulationsPopover__subtitle ImageManipulationsPopover__subtitle__windowSize'
          >
            Relative to window size:
          </Text>
          <Text className='ImageManipulationsPopover__sizePercent'>
            {manipulations.mediaItemSize}%
          </Text>
        </div> */}
        <div className='ImagePropertiesPopover__Slider'>
          <Text>15%</Text>
          <Slider
            valueLabelDisplay='auto'
            getAriaValueText={(val) => `${val}`}
            value={sizeValue}
            onChange={onSizeValueChange as any}
            step={sizeProps.step}
            max={sizeProps.max}
            min={sizeProps.min}
          />
          <Text>70%</Text>
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
  );
}

ImagePropertiesPopover.displayName = 'ImagePropertiesPopover';

export default React.memo<IImagePropertiesPopoverProps>(ImagePropertiesPopover);
