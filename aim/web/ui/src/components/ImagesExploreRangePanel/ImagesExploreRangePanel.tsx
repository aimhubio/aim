import React from 'react';

import { Slider } from '@material-ui/core';

import { Button, Text } from 'components/kit';

import imagesExploreAppModel from 'services/models/imagesExplore/imagesExploreAppModel';

import { IImagesExploreRangePanelProps } from './types.d';

import './styles.scss';

function ImagesExploreRangePanel({
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
  searchButtonDisabled,
}: IImagesExploreRangePanelProps): React.FunctionComponentElement<React.ReactNode> {
  const searchMetricsRef = React.useRef<any>(null);

  function handleSearch() {
    searchMetricsRef.current = imagesExploreAppModel.getImagesData();
    searchMetricsRef.current.call();
  }
  return (
    <div className='ImagesExploreRangePanel'>
      <div className='ImagesExploreRangePanel__sliderContainer'>
        <Text
          className='ImagesExploreRangePanel__sliderContainer__title'
          size={10}
          weight={500}
          tint={70}
          color='primary'
        >
          Step:
        </Text>
        <div className='ImagesExploreRangePanel__sliderContainer__sliderBox'>
          <Slider
            value={recordSlice}
            onChange={onRecordSliceChange}
            min={stepRange[0]}
            max={stepRange[1]}
            valueLabelDisplay='auto'
            getAriaValueText={(value) => `${value}`}
          />
        </div>
        <Text
          size={10}
          weight={600}
          tint={80}
          className='ImagesExploreRangePanel__sliderContainer__sliderValuesLabel'
        >{`${recordSlice[0]} - ${recordSlice[1]}`}</Text>
        <Text
          className='ImagesExploreRangePanel__sliderContainer__densityFieldLabel'
          size={10}
          weight={500}
          tint={70}
          color='primary'
        >
          Steps Density:
        </Text>
        <input
          type='number'
          value={recordDensity}
          onChange={onRecordDensityChange}
          className='ImagesExploreRangePanel__sliderContainer__densityField'
        />
      </div>
      <div className='ImagesExploreRangePanel__sliderContainer'>
        <Text
          className='ImagesExploreRangePanel__sliderContainer__title'
          size={10}
          weight={500}
          tint={70}
          color='primary'
        >
          Index
        </Text>
        <div className='ImagesExploreRangePanel__sliderContainer__sliderBox'>
          <Slider
            value={indexSlice}
            onChange={onIndexSliceChange}
            min={indexRange[0]}
            max={indexRange[1]}
            valueLabelDisplay='auto'
            getAriaValueText={(value) => `${value}`}
          />
        </div>
        <Text
          size={10}
          weight={600}
          tint={80}
          className='ImagesExploreRangePanel__sliderContainer__sliderValuesLabel'
        >{`${indexSlice[0]} - ${indexSlice[1]}`}</Text>
        <Text
          className='ImagesExploreRangePanel__sliderContainer__densityFieldLabel'
          size={10}
          weight={500}
          tint={70}
          color='primary'
        >
          Index Density:
        </Text>
        <input
          type='number'
          value={indexDensity}
          onChange={onIndexDensityChange}
          className='ImagesExploreRangePanel__sliderContainer__densityField'
        />
      </div>
      <Button
        size='small'
        color='primary'
        variant='contained'
        onClick={handleSearch}
        className={'ImagesExploreRangePanel__searchButton'}
        disabled={searchButtonDisabled}
      >
        Search
      </Button>
    </div>
  );
}

ImagesExploreRangePanel.displayName = 'ImagesExploreRangePanel';

export default React.memo<IImagesExploreRangePanelProps>(
  ImagesExploreRangePanel,
);
