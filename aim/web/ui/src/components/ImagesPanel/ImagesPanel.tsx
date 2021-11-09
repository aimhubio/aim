import React, { useEffect, useRef, useState } from 'react';
import { isEmpty } from 'lodash-es';

import { Slider, TextField } from '@material-ui/core';

import ImagesSet from 'components/ImagesSet/ImagesSet';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import ImagesExploreRangePanel from 'components/ImagesExploreRangePanel';

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
  getImagesBlobsData,
  isLoading,
}: IImagesPanelProps): React.FunctionComponentElement<React.ReactNode> {
  let timeoutID: number = 0;
  let blobUriArray: string[] = [];
  const imagesSetWrapper = useRef<any>({});

  function onScroll() {
    if (timeoutID) {
      window.clearTimeout(timeoutID);
    }
    timeoutID = window.setTimeout(() => {
      if (!isEmpty(blobUriArray)) {
        getImagesBlobsData(blobUriArray).then(() => {
          blobUriArray = [];
        });
      }
    }, 1000);
  }

  useEffect(() => {
    return () => {
      timeoutID && window.clearTimeout(timeoutID);
    };
  }, []);

  function addUriToList(blobUrl: string) {
    if (!imagesBlobs?.[blobUrl]) {
      blobUriArray.push(blobUrl);
    }
  }

  return (
    <BusyLoaderWrapper
      isLoading={isLoading}
      className='ImagesExplore__loader'
      height='100%'
      loaderComponent={<ChartLoader controlsCount={0} />}
    >
      {!isEmpty(imagesData) ? (
        <div className='ImagesPanel'>
          <div
            className='ImagesPanel__imagesContainer'
            ref={imagesSetWrapper}
            style={{ height: '100%' }}
          >
            <ImagesSet
              data={imagesData}
              title={'root'}
              imagesBlobs={imagesBlobs}
              onScroll={onScroll}
              addUriToList={addUriToList}
              imagesSetWrapper={imagesSetWrapper}
            />
          </div>
          <ImagesExploreRangePanel
            recordSlice={recordSlice}
            indexSlice={indexSlice}
            indexRange={indexRange}
            stepRange={stepRange}
            indexDensity={indexDensity}
            recordDensity={recordDensity}
            onIndexSliceChange={onIndexSliceChange}
            onRecordSliceChange={onRecordSliceChange}
            onRecordDensityChange={onRecordDensityChange}
            onIndexDensityChange={onIndexDensityChange}
          />
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
