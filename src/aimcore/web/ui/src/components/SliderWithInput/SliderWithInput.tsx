import React from 'react';

import { Tooltip } from '@material-ui/core';

import { Text, Slider, InputWrapper } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

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
  inputValidationPatterns,
}: ISliderWithInputProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
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
              onChange={(e: any, value: any) => {
                onCountChange(value);
              }}
              getAriaValueText={(value) => `${value}`}
              aria-labelledby='track-false-slider'
              track={false}
              min={selectedRangeValue[0]}
              max={selectedRangeValue[1]}
              valueLabelDisplay='auto'
            />
          ) : (
            <Slider
              value={[...selectedRangeValue]}
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
          <InputWrapper
            value={`${selectedCountValue}`}
            type='number'
            labelAppearance='top-labeled'
            size='small'
            label={countInputTitle}
            topLabeledIconName='circle-question'
            labelHelperText={countTitleTooltip}
            placeholder={countInputTitle}
            showMessageByTooltip
            isValidateInitially={true}
            onChange={(e, value, metadata) => {
              onCountChange(value, metadata);
            }}
            validationPatterns={inputValidationPatterns ?? []}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

SliderWithInput.displayName = 'SliderWithInput';

export default React.memo<ISliderWithInputProps>(SliderWithInput);
