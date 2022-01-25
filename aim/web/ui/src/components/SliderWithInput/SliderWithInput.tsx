import React from 'react';
import { isString, isEmpty } from 'lodash';

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
              onChange={(value: any) => onCountChange(value)}
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
          {/* <div className='SliderWithInput__densityWrapper__densityTitleBox'>
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
        </div> */}
          {/* <input
          type='number'
          value={`${selectedCountValue}`}
          step={1}
          onChange={(e) => {
            e.preventDefault();
            if (+e.target.value < min || +e.target.value > max) return;
            onCountChange({
              target: { value: e.target.value as any },
            } as any);
          }}
          className='SliderWithInput__densityWrapper__densityField'
        /> */}
          <InputWrapper
            value={`${selectedCountValue}`}
            type='number'
            labelAppearance='top-labeled'
            size='small'
            label={countInputTitle}
            labelIconName='circle-question'
            labelHelperText={countTitleTooltip}
            placeholder={countInputTitle}
            showMessageByTooltip
            // isValidateInitially={true}
            onChange={(e, value, metadata) => {
              console.clear();
              console.log(
                '🚀 ~ file: SliderWithInput.tsx ~ line 133 ~ metadata',
                metadata,
              );
              console.log(
                '🚀 ~ file: SliderWithInput.tsx ~ line 133 ~ value',
                value,
              );
              console.log('🚀 ~ file: SliderWithInput.tsx ~ line 135 ~ e', e);

              onCountChange(value, metadata);
            }}
            validationPatterns={[
              // TODO replace condition field to
              // errorCondition maybe we need success or warningCondition field in a feature
              {
                errorCondition: (value) => +value < min,
                errorText: `Value should be equal or greater then ${min}`,
              },
              {
                errorCondition: (value) => +value > max,
                errorText: `Value should be equal or smaller then ${max}`,
              },
              {
                errorCondition: (value) => +value === 0,
                errorText: "Value can't be equal to 0",
              },
              {
                errorCondition: new RegExp(/[9]/g),
                errorText: 'Value should be equal or smaller then 9',
              },
              {
                errorCondition: (value) => isString(value) && isEmpty(value),
                errorText: 'Field is required and cant be empty',
              },
            ]}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

SliderWithInput.displayName = 'SliderWithInput';

export default React.memo<ISliderWithInputProps>(SliderWithInput);
