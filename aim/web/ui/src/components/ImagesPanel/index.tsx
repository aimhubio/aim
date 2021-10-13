import React from 'react';
import { Slider, TextField } from '@material-ui/core';

import { IImagesPanelProps } from './ImagesPanel';
import ImagesSet from 'components/ImagesSet/ImagesSet';

import './ImagesPanel.scss';

function ImagesPanel({
  imagesData,
  stepSlice,
  indexSlice,
  indexRange,
  stepRange,
  indexInterval,
  stepInterval,
  onIndexSliceChange,
  onStepSliceChange,
  onStepIntervalChange,
  onIndexIntervalChange,
}: IImagesPanelProps): React.FunctionComponentElement<React.ReactNode> {
  return imagesData ? (
    <div className='ImagesPanel'>
      <div className='ImagesPanel__slidersContainer'>
        <div className='ImagesPanel__slidersContainer__sliderContainer'>
          <p className='ImagesPanel__slidersContainer__sliderContainer__title'>
            Step
          </p>
          <div className='ImagesPanel__slidersContainer__sliderContainer__sliderBox'>
            <Slider
              value={stepSlice}
              onChange={onStepSliceChange}
              min={stepRange[0]}
              max={stepRange[1]}
              valueLabelDisplay='auto'
              getAriaValueText={(value) => `${value}`}
            />
          </div>
          <TextField
            type='number'
            value={stepInterval}
            size='small'
            variant='outlined'
            onChange={onStepIntervalChange}
            className='TextField__TextArea__OutLined__Small ImagesPanel__slidersContainer__sliderContainer__intervalField'
          />
        </div>
        <div className='ImagesPanel__slidersContainer__sliderContainer'>
          <p className='ImagesPanel__slidersContainer__sliderContainer__title'>
            Index
          </p>
          <div className='ImagesPanel__slidersContainer__sliderContainer__sliderBox'>
            <Slider
              value={indexSlice}
              onChange={onIndexSliceChange}
              min={indexRange[0]}
              max={indexRange[1]}
              valueLabelDisplay='auto'
              getAriaValueText={(value) => `${value}`}
            />
          </div>
          <TextField
            type='number'
            size='small'
            value={indexInterval}
            onChange={onIndexIntervalChange}
            variant='outlined'
            className='TextField__TextArea__OutLined__Small ImagesPanel__slidersContainer__sliderContainer__intervalField'
          />
        </div>
      </div>
      <div className='ImagesPanel__imagesContainer'>
        <ImagesSet data={imagesData} title={'root'} />
      </div>
    </div>
  ) : (
    <div></div>
  );
}

export default ImagesPanel;
