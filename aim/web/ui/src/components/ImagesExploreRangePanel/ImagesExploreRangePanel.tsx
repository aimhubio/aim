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
  onSliceRangeChange,
  onDensityChange,
  applyButtonDisabled,
}: IImagesExploreRangePanelProps): React.FunctionComponentElement<React.ReactNode> {
  const searchMetricsRef = React.useRef<any>(null);
  function handleSearch() {
    searchMetricsRef.current = imagesExploreAppModel.getImagesData();
    searchMetricsRef.current.call();
  }

  return (
    <form className='ImagesExploreRangePanel' onSubmit={handleSearch}>
      <div className='ImagesExploreRangePanel__sliderContainer'>
        <Text
          className='ImagesExploreRangePanel__sliderContainer__title'
          size={10}
          weight={500}
          tint={70}
          color='primary'
        >
          Steps:
        </Text>
        <div className='ImagesExploreRangePanel__sliderContainer__sliderBox'>
          <Slider
            value={recordSlice}
            onChange={(e, value) => onSliceRangeChange('recordSlice', value)}
            min={stepRange[0]}
            max={stepRange[1]}
            valueLabelDisplay='auto'
            getAriaValueText={(value) => `${value}`}
            onKeyPress={(e) => {
              if (e.which === 13) {
                handleSearch();
              }
            }}
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
          data-key='recordDensity'
          value={recordDensity}
          onChange={onDensityChange}
          className={`ImagesExploreRangePanel__sliderContainer__densityField ${
            recordDensity == 0
              ? 'ImagesExploreRangePanel__sliderContainer__densityField-invalid'
              : ''
          }`}
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
          Index:
        </Text>
        <div className='ImagesExploreRangePanel__sliderContainer__sliderBox'>
          <Slider
            value={indexSlice}
            onChange={(e, value) => onSliceRangeChange('indexSlice', value)}
            min={indexRange[0]}
            max={indexRange[1]}
            valueLabelDisplay='auto'
            getAriaValueText={(value) => `${value}`}
            onKeyPress={(e) => {
              if (e.which === 13) {
                handleSearch();
              }
            }}
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
          data-key='indexDensity'
          value={indexDensity}
          onChange={onDensityChange}
          className={`ImagesExploreRangePanel__sliderContainer__densityField ${
            indexDensity == 0
              ? 'ImagesExploreRangePanel__sliderContainer__densityField-invalid'
              : ''
          }`}
        />
      </div>
      <div className='ImagesExploreRangePanel__searchButtonContainer'>
        <Button
          size='small'
          color='primary'
          variant='contained'
          type='submit'
          onClick={handleSearch}
          className='ImagesExploreRangePanel__searchButtonContainer__searchButton'
          disabled={applyButtonDisabled}
        >
          Apply
        </Button>
      </div>
    </form>
  );
}

ImagesExploreRangePanel.displayName = 'ImagesExploreRangePanel';

export default React.memo<IImagesExploreRangePanelProps>(
  ImagesExploreRangePanel,
);
