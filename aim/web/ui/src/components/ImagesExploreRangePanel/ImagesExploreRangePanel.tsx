import React from 'react';

import { Button } from 'components/kit';
import SliderWithInput from 'components/SliderWithInput';

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
    searchMetricsRef.current = imagesExploreAppModel.getImagesData(true);
    searchMetricsRef.current.call();
  }

  return (
    <form className='ImagesExploreRangePanel' onSubmit={handleSearch}>
      <div className='ImagesExploreRangePanel__container'>
        <SliderWithInput
          sliderTitle='Steps'
          countInputTitle='Steps count'
          countTitleTooltip='Number of steps to display'
          sliderTitleTooltip='Training step. Increments every time track() is called'
          min={stepRange[0]}
          max={stepRange[1]}
          selectedRangeValue={recordSlice}
          selectedCountValue={recordDensity}
          onSearch={handleSearch}
          onRangeChange={(value: number | number[]) =>
            onSliceRangeChange('recordSlice', value)
          }
          onCountChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onDensityChange(event, 'recordDensity')
          }
        />
        <div className='ImagesExploreRangePanel__container__sliderContainerSeparator'></div>
        <SliderWithInput
          sliderTitle='Indices'
          countInputTitle='Indices count'
          countTitleTooltip='Number of images per step'
          sliderTitleTooltip='Index in the list of images passed to track() call'
          min={indexRange[0]}
          max={indexRange[1]}
          selectedRangeValue={indexSlice}
          selectedCountValue={indexDensity}
          onSearch={handleSearch}
          onRangeChange={(value: number | number[]) =>
            onSliceRangeChange('indexSlice', value)
          }
          onCountChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onDensityChange(event, 'indexDensity')
          }
        />
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
