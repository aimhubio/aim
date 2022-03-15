import React from 'react';
import _ from 'lodash';

import SliderWithInput from 'components/SliderWithInput';
import { Button } from 'components/kit';
import { IValidationMetadata, IValidationPatterns } from 'components/kit/Input';

interface IRangeSliderWithInputItem {
  sliderName: string;
  inputName: string;
  sliderTitle: string;
  inputTitle: string;
  sliderTitleTooltip: string;
  inputTitleTooltip: string;
  /**
   * min, max values
   */
  rangeEndpoints: [number, number];
  selectedRangeValue: [number, number];
  inputValue: number;
  sliderType: 'single' | 'range'; // This type is same as SliderWithInput component sliderType prop type.
  inputValidationPatterns?: IValidationPatterns;
}

type RangeSliderData = IRangeSliderWithInputItem[];

interface IRangeSliderPanelProps {
  items?: RangeSliderData;
  onApply: () => void;
  onInputChange: (
    name: string,
    value: number,
    metadata?: IValidationMetadata,
  ) => void;
  onRangeSliderChange: (name: string, newValue: number[] | number) => void;
  applyButtonDisabled: boolean;
}

function RangePanel({
  onApply,
  applyButtonDisabled,
  onRangeSliderChange,
  onInputChange,
  items,
}: IRangeSliderPanelProps) {
  return (
    <form
      className='RangePanel'
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div className='RangePanelContainer'>
        {items?.map((item) => {
          const rangeLength = _.range(
            item.rangeEndpoints?.[0] ?? 0,
            (item.rangeEndpoints?.[1] ?? 0) + 1,
          ).length;
          return (
            <React.Fragment key={item.sliderName}>
              <SliderWithInput
                sliderType={item?.sliderType}
                sliderTitle={item.sliderTitle}
                countInputTitle={item.inputTitle}
                countTitleTooltip={item.inputTitleTooltip}
                sliderTitleTooltip={item.sliderTitleTooltip}
                min={item.rangeEndpoints?.[0]}
                max={item.rangeEndpoints?.[1]}
                selectedRangeValue={item.selectedRangeValue}
                selectedCountValue={item.inputValue}
                onSearch={onApply}
                onRangeChange={(value) =>
                  onRangeSliderChange(item.sliderName, value)
                }
                onCountChange={(value, metadata?: IValidationMetadata) => {
                  onInputChange(item.inputName, value, metadata);
                }}
                inputValidationPatterns={
                  item?.inputValidationPatterns ?? [
                    {
                      errorCondition: (value: string | number) => +value <= 0,
                      errorText: `Value should be greater then ${0}`,
                    },
                    {
                      errorCondition: (value: string | number) => {
                        return +value > rangeLength;
                      },
                      errorText: `Value should be smaller then ${
                        rangeLength + 1
                      }`,
                    },
                  ]
                }
              />
              <div className='VerticalDivider' />
            </React.Fragment>
          );
        })}
        <div className='ApplyButtonContainer'>
          <Button
            size='small'
            color='primary'
            variant='contained'
            type='submit'
            className='ApplyButton'
            disabled={applyButtonDisabled}
          >
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
}

RangePanel.displayName = 'RangePanel';

export default React.memo<IRangeSliderPanelProps>(RangePanel);
