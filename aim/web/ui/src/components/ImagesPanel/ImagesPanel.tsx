import React from 'react';
import { Slider, TextField } from '@material-ui/core';
import { isEmpty } from 'lodash-es';

import ImagesSet from 'components/ImagesSet/ImagesSet';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import TableLoader from 'components/TableLoader/TableLoader';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import { IImagesPanelProps } from './ImagesPanel.d';

import './ImagesPanel.scss';

function ImagesPanel({
  imagesData,
  imagesBlobs,
  recordSlice,
  indexSlice,
  indexRange,
  stepRange,
  indexDensity,
  recordDensity,
  onIndexSliceChange,
  onRecordSliceChange,
  onRecordDensityChange,
  onIndexDensityChange,
  isLoading,
}: IImagesPanelProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <BusyLoaderWrapper
      isLoading={isLoading}
      className='ImagesExplore__loader'
      height='100%'
      loaderComponent={<TableLoader />}
    >
      {!isEmpty(imagesData) ? (
        <div className='ImagesPanel'>
          <div className='ImagesPanel__slidersContainer'>
            <div className='ImagesPanel__slidersContainer__sliderContainer'>
              <p className='ImagesPanel__slidersContainer__sliderContainer__title'>
                Step
              </p>
              <div className='ImagesPanel__slidersContainer__sliderContainer__sliderBox'>
                <Slider
                  value={recordSlice}
                  onChange={onRecordSliceChange}
                  min={stepRange[0]}
                  max={stepRange[1]}
                  valueLabelDisplay='auto'
                  getAriaValueText={(value) => `${value}`}
                />
              </div>
              <TextField
                type='number'
                value={recordDensity}
                size='small'
                variant='outlined'
                onChange={onRecordDensityChange}
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
                value={indexDensity}
                onChange={onIndexDensityChange}
                variant='outlined'
                className='TextField__TextArea__OutLined__Small ImagesPanel__slidersContainer__sliderContainer__intervalField'
              />
            </div>
          </div>
          <div className='ImagesPanel__imagesContainer'>
            <ImagesSet
              data={imagesData}
              title={'root'}
              imagesBlobs={imagesBlobs}
            />
          </div>
        </div>
      ) : (
        <EmptyComponent
          size='big'
          content="It's super easy to search Aim experiments. Lookup search docs to learn more."
        />
      )}
    </BusyLoaderWrapper>
  );
}

export default ImagesPanel;
