import React from 'react';

import { Divider } from '@material-ui/core';

import { Slider, Text, ToggleButton } from 'components/kit';

import {
  // ImageAlignmentEnum,
  ImageRenderingEnum,
} from 'config/enums/imageEnums';

import { IImagePropertiesPopoverProps } from './types';

import './styles.scss';

const sizeProps = {
  step: 1,
  min: 15,
  max: 70,
};

// const alignmentOptions = [
//   { label: 'Original', value: ImageAlignmentEnum.Original },
//   { label: 'Align By Width', value: ImageAlignmentEnum.Width },
//   { label: 'Align By Height', value: ImageAlignmentEnum.Height },
// ];

function ImagePropertiesPopover({
  imageProperties,
  onImageSizeChange,
  onImageRenderingChange,
}: // onImageAlignmentChange,
IImagePropertiesPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  // const [open, setOpen] = React.useState<boolean>(false);
  const [sizeValue, setSizeValue] = React.useState<number>(
    imageProperties.imageSize,
  );

  function onSizeValueChange(
    event: React.ChangeEvent<{}>,
    newValue: number | number[],
  ): void & React.FormEventHandler<HTMLSpanElement> {
    setSizeValue(newValue as number);
  }
  return (
    <div className={'ImagePropertiesPopover'}>
      <div className='ImagePropertiesPopover__section'>
        <div className='flex fac ImagePropertiesPopover__section__imageSize'>
          <Text
            tint={50}
            component='h4'
            className='ImagePropertiesPopover__subtitle'
          >
            Image Size:
          </Text>
          <Text className='ImagePropertiesPopover__sizePercent'>
            {imageProperties.imageSize}%
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
            {manipulations.imageSize}%
          </Text>
        </div> */}
        <div className='ImagePropertiesPopover__Slider'>
          <Text>15%</Text>
          <Slider
            valueLabelDisplay='auto'
            getAriaValueText={(val) => `${val}`}
            value={sizeValue}
            onChange={onSizeValueChange as any}
            onChangeCommitted={onImageSizeChange}
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
          rightLabel={ImageRenderingEnum.Optimize}
          leftLabel={ImageRenderingEnum.Pixelated}
          leftValue={ImageRenderingEnum.Pixelated}
          rightValue={ImageRenderingEnum.Optimize}
          value={imageProperties.imageRendering}
        />
      </div>
    </div>
  );
}

ImagePropertiesPopover.displayName = 'ImagePropertiesPopover';

export default React.memo<IImagePropertiesPopoverProps>(ImagePropertiesPopover);
