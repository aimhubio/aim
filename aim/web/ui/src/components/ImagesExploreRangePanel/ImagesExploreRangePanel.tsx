import React from 'react';

import { Slider, Tooltip } from '@material-ui/core';

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
      <div className='ImagesExploreRangePanel__container'>
        <div className='ImagesExploreRangePanel__container__sliderContainer'>
          <div className='ImagesExploreRangePanel__container__sliderContainer__sliderWrapper'>
            <div className='ImagesExploreRangePanel__container__sliderContainer__sliderWrapper__sliderTitleBox'>
              <Tooltip title='Training step. Increments every time track() is called'>
                <span className='ImagesExploreRangePanel__container__sliderContainer__sliderWrapper__title'>
                  Steps:
                </span>
              </Tooltip>
              <Text
                size={10}
                weight={600}
                tint={80}
                className='ImagesExploreRangePanel__container__sliderContainer__sliderWrapper__sliderValuesLabel'
              >{`${recordSlice[0]} - ${recordSlice[1]}`}</Text>
            </div>

            <div className='ImagesExploreRangePanel__container__sliderContainer__sliderWrapper__sliderBox'>
              <Slider
                value={recordSlice}
                onChange={(e, value) =>
                  onSliceRangeChange('recordSlice', value)
                }
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
          </div>
          <div className='ImagesExploreRangePanel__container__sliderContainer__densityWrapper'>
            <div className='ImagesExploreRangePanel__container__sliderContainer__densityWrapper__densityTitleBox'>
              <Text
                className='ImagesExploreRangePanel__container__sliderContainer__densityWrapper__densityTitleBox__densityFieldLabel'
                size={10}
                weight={400}
                tint={70}
                color='primary'
              >
                Steps count:
              </Text>
              <Tooltip title='Number of steps to display' placement='right-end'>
                <div className='ImagesExploreRangePanel__container__sliderContainer__densityWrapper__densityTitleBox__labelTooltip'>
                  ?
                </div>
              </Tooltip>
            </div>
            <input
              type='number'
              data-key='recordDensity'
              value={recordDensity}
              onChange={onDensityChange}
              className={`ImagesExploreRangePanel__container__sliderContainer__densityWrapper__densityField ${
                recordDensity === 0
                  ? 'ImagesExploreRangePanel__container__sliderContainer__densityWrapper__densityField-invalid'
                  : ''
              }`}
            />
          </div>
        </div>
        <div className='ImagesExploreRangePanel__container__sliderContainerSeparator'></div>
        <div className='ImagesExploreRangePanel__container__sliderContainer'>
          <div className='ImagesExploreRangePanel__container__sliderContainer__sliderWrapper'>
            <div className='ImagesExploreRangePanel__container__sliderContainer__sliderWrapper__sliderTitleBox'>
              <Tooltip title='Index in the list of images passed to track() call'>
                <span className='ImagesExploreRangePanel__container__sliderContainer__sliderWrapper__title'>
                  Indices:
                </span>
              </Tooltip>
              <Text
                size={10}
                weight={600}
                tint={80}
                className='ImagesExploreRangePanel__container__sliderContainer__sliderWrapper__sliderValuesLabel'
              >{`${indexSlice[0]} - ${indexSlice[1]}`}</Text>
            </div>

            <div className='ImagesExploreRangePanel__container__sliderContainer__sliderWrapper__sliderBox'>
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
          </div>
          <div className='ImagesExploreRangePanel__container__sliderContainer__densityWrapper'>
            <div className='ImagesExploreRangePanel__container__sliderContainer__densityWrapper__densityTitleBox'>
              <Text
                className='ImagesExploreRangePanel__container__sliderContainer__densityWrapper__densityTitleBox__densityFieldLabel'
                size={10}
                weight={500}
                tint={70}
                color='primary'
              >
                Index count:
              </Text>
              <Tooltip title='Number of images per step' placement='right-end'>
                <div className='ImagesExploreRangePanel__container__sliderContainer__densityWrapper__densityTitleBox__labelTooltip'>
                  ?
                </div>
              </Tooltip>
            </div>
            <input
              type='number'
              data-key='indexDensity'
              value={indexDensity}
              onChange={onDensityChange}
              className={`ImagesExploreRangePanel__container__sliderContainer__densityWrapper__densityField ${
                indexDensity === 0
                  ? 'ImagesExploreRangePanel__container__sliderContainer__densityWrapper__densityField-invalid'
                  : ''
              }`}
            />
          </div>
        </div>
        <div className='ImagesExploreRangePanel__container__searchButtonContainer'>
          <Button
            size='small'
            color='primary'
            variant='contained'
            type='submit'
            onClick={handleSearch}
            className='ImagesExploreRangePanel__container__searchButtonContainer__searchButton'
            disabled={applyButtonDisabled}
          >
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
}

ImagesExploreRangePanel.displayName = 'ImagesExploreRangePanel';

export default React.memo<IImagesExploreRangePanelProps>(
  ImagesExploreRangePanel,
);
