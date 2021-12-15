import React from 'react';

import { Tooltip } from '@material-ui/core';

import { Text, Slider } from 'components/kit';

import { ISliderWithInputProps } from './types.d';

import './SliderWithInput.scss';

/**
 * @property {string} sliderTitle - title of slider
 * @property {string} countInputTitle - title of count input
 * @property {number} selectedRangeValue - selected range value
 * @property {number} selectedCountValue - selected input value
 * @property {function} onSearch - search method
 * @property {function} onCountChange - count change method
 * @property {function} onRangeChange - range change method
 * @property {number} min - minimum range value
 * @property {number} max - maximum range value
 * @property {string}  sliderTitleTooltip - tooltip value of slider title
 * @property {string}  countTitleTooltip - tooltip value of count title
 */

function SliderWithInput({
  sliderTitle,
  countInputTitle,
  selectedRangeValue,
  selectedCountValue,
  onSearch,
  onCountChange,
  onRangeChange,
  min,
  max,
  sliderTitleTooltip,
  countTitleTooltip,
  sliderType = 'range',
}: ISliderWithInputProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className={'SliderWithInput'}>
      <div className='SliderWithInput__sliderWrapper'>
        <div className='SliderWithInput__sliderWrapper__sliderTitleBox'>
          {sliderTitleTooltip ? (
            <Tooltip title={sliderTitleTooltip}>
              <span className='SliderWithInput__sliderWrapper__title'>
                {sliderTitle}:
              </span>
            </Tooltip>
          ) : (
            <span className='SliderWithInput__sliderWrapper__title'>
              {sliderTitle}:
            </span>
          )}
          <Text
            size={10}
            weight={600}
            tint={80}
            className='SliderWithInput__sliderWrapper__sliderValuesLabel'
          >{`${selectedRangeValue[0]} - ${selectedRangeValue[1]}`}</Text>
        </div>
        {sliderType === 'single' ? (
          <Slider
            value={selectedCountValue}
            onChange={
              ((e: any, value: any) =>
                onCountChange({
                  target: { value },
                } as any)) as any
            }
            getAriaValueText={(value) => `${value}`}
            aria-labelledby='track-false-slider'
            track={false}
            min={selectedRangeValue[0]}
            max={selectedRangeValue[1]}
            valueLabelDisplay='auto'
          />
        ) : (
          <Slider
            value={selectedRangeValue}
            onChange={((e: any, value: any) => onRangeChange(value)) as any}
            min={min}
            max={max}
            valueLabelDisplay='auto'
            getAriaValueText={(value) => `${value}`}
            onKeyPress={(e) => {
              if (e.which === 13) {
                onSearch();
              }
            }}
          />
        )}
      </div>
      <div className='SliderWithInput__densityWrapper'>
        <div className='SliderWithInput__densityWrapper__densityTitleBox'>
          <Text
            className='SliderWithInput__densityWrapper__densityTitleBox__densityFieldLabel'
            size={10}
            weight={400}
            tint={70}
            color='primary'
          >
            {countInputTitle}:
          </Text>
          {countTitleTooltip && (
            <Tooltip title={countTitleTooltip} placement='right-end'>
              <div className='SliderWithInput__densityWrapper__densityTitleBox__labelTooltip'>
                ?
              </div>
            </Tooltip>
          )}
        </div>
        <input
          type='number'
          value={`${selectedCountValue}`}
          step={1}
          onChange={(e) => {
            e.preventDefault();
            if (
              sliderType === 'single' &&
              (+e.target.value < min || +e.target.value > max)
            )
              return;
            onCountChange({
              target: { value: e.target.value as any },
            } as any);
          }}
          className={`SliderWithInput__densityWrapper__densityField ${
            selectedCountValue === 0 && sliderType !== 'single'
              ? 'SliderWithInput__densityWrapper__densityField-invalid'
              : ''
          }`}
        />
      </div>
    </div>
  );
}

SliderWithInput.displayName = 'SliderWithInput';

export default React.memo<ISliderWithInputProps>(SliderWithInput);
