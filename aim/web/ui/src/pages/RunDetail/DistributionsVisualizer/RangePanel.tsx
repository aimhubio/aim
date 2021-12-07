import React from 'react';

import RangeSliderWithInput from 'components/RangeSliderWithInput';
import { Button } from 'components/kit';

import './style.scss';

interface IRangeSliderWithInputItem {
  name: string;
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
}

type RangeSliderData = IRangeSliderWithInputItem[];

interface IRangeSliderPanelProps {
  items?: RangeSliderData;
  onApply?: () => null;
  onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => null;
  onRangeSliderChange?: (newValue: number[] | number) => null;
}

function RangePanel({ onApply, items }: IRangeSliderPanelProps) {
  return (
    <form className='RangePanel' onSubmit={onApply}>
      <div className='RangePanelContainer'>
        {items?.map((item) => (
          <RangeSliderWithInput
            key={item.name}
            sliderTitle={item.sliderTitle}
            countInputTitle={item.inputTitle}
            countTitleTooltip={item.inputTitleTooltip}
            sliderTitleTooltip={item.sliderTitleTooltip}
            min={item.rangeEndpoints[0]}
            max={item.rangeEndpoints[1]}
            selectedRangeValue={item.selectedRangeValue}
            selectedCountValue={item.inputValue}
            onSearch={() => null}
            onRangeChange={() => null}
            onCountChange={() => null}
          />
        ))}
        <div className='VerticalDivider' />
        <div className='ApplyButtonContainer'>
          <Button
            size='small'
            color='primary'
            variant='contained'
            type='submit'
            onClick={onApply}
            className='ApplyButton'
            disabled={false}
          >
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
}

export default React.memo<IRangeSliderPanelProps>(RangePanel);
