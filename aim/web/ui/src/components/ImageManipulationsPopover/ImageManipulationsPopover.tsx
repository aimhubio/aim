import React from 'react';

import { Divider, Slider } from '@material-ui/core';

import { Dropdown, Text, ToggleButton } from 'components/kit';

import {
  ImageAlignmentEnum,
  ImageRenderingEnum,
} from 'config/enums/imageEnums';

import { IImageManipulationsPopoverProps } from '.';

import './ImageManipulationsPopover.scss';

const sizeProps = {
  marks: [
    { value: 5, label: '5' },
    { value: 25, label: '25' },
    { value: 51, label: '51' },
    { value: 75, label: '75' },
    { value: 95, label: '95' },
  ],
  step: 2,
  min: 5,
  max: 95,
};

const alignmentOptions = [
  { label: 'Original', value: ImageAlignmentEnum.Original },
  { label: 'Align By Width', value: ImageAlignmentEnum.Width },
  { label: 'Align By Height', value: ImageAlignmentEnum.Height },
];

function ImageManipulationsPopover({
  manipulations,
  onImageSizeChange,
  onImageRenderingChange,
  onImageAlignmentChange,
}: IImageManipulationsPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const [open, setOpen] = React.useState<boolean>(false);
  const [sizeValue, setSizeValue] = React.useState<number>(
    manipulations.imageSize,
  );

  function onSizeValueChange(
    event: React.ChangeEvent<{}>,
    newValue: number | number[],
  ) {
    setSizeValue(newValue as number);
  }
  return (
    <div className={'ImageManipulationsPopover'}>
      <div className='ImageManipulationsPopover__section'>
        <Text
          tint={50}
          component='h4'
          className='ImageManipulationsPopover__subtitle'
        >
          Image Size:
        </Text>
        <div>
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
        </div>
        <div className='flex fac'>
          <Text
            tint={50}
            component='h4'
            className='ImageManipulationsPopover__subtitle'
          >
            RELATIVE TO WINDOW SIZE:
          </Text>
          <Text className='ImageManipulationsPopover__sizePercent'>
            {manipulations.imageSize}%
          </Text>
        </div>
        <div className='ImageManipulationsPopover__Slider'>
          <Slider
            defaultValue={0}
            valueLabelDisplay='auto'
            getAriaValueText={(val) => `${val}s`}
            value={sizeValue}
            onChange={onSizeValueChange}
            disabled={
              manipulations.alignmentType === ImageAlignmentEnum.Original
            }
            onChangeCommitted={onImageSizeChange}
            marks={sizeProps.marks}
            step={sizeProps.step}
            max={sizeProps.max}
            min={sizeProps.min}
          />
        </div>
      </div>
      <Divider className='ImageManipulationsPopover__Divider' />
      <div className='ImageManipulationsPopover__section'>
        <Text
          component='h4'
          tint={50}
          className='ImageManipulationsPopover__subtitle'
        >
          Image Rendering
        </Text>
        <ToggleButton
          className='ImageManipulationsPopover__ToggleButton'
          title='Select Method'
          onChange={onImageRenderingChange}
          rightLabel={ImageRenderingEnum.Smoothened}
          leftLabel={ImageRenderingEnum.Pixelated}
          leftValue={ImageRenderingEnum.Pixelated}
          rightValue={ImageRenderingEnum.Smoothened}
          value={manipulations.imageRendering}
        />
      </div>
    </div>
  );
}

ImageManipulationsPopover.displayName = 'ImageManipulationsPopover';

export default React.memo<IImageManipulationsPopoverProps>(
  ImageManipulationsPopover,
);
