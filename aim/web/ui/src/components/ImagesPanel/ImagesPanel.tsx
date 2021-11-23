import React, { useEffect, useMemo, useRef } from 'react';
import { isEmpty } from 'lodash-es';

import ImagesSet from 'components/ImagesSet/ImagesSet';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import ImagesExploreRangePanel from 'components/ImagesExploreRangePanel';
import { Text } from 'components/kit';

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
  onSliceRangeChange,
  onDensityChange,
  getImagesBlobsData,
  isLoading,
  applyButtonDisabled,
  panelResizing,
  imageWrapperOffsetHeight,
  imageWrapperOffsetWidth,
  isRangePanelShow,
}: IImagesPanelProps): React.FunctionComponentElement<React.ReactNode> {
  let timeoutID = useRef(0);
  let blobUriArray: string[] = [];

  function onScroll(e?: any) {
    if (timeoutID.current) {
      window.clearTimeout(timeoutID.current);
    }
    timeoutID.current = window.setTimeout(() => {
      if (!isEmpty(blobUriArray)) {
        getImagesBlobsData(blobUriArray).then(() => {
          blobUriArray = [];
        });
      }
    }, 1000);
  }

  const imagesSetKey = useMemo(
    () => Date.now(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      imagesData,
      imagesBlobs,
      imageWrapperOffsetHeight,
      imageWrapperOffsetWidth,
    ],
  );

  useEffect(() => {
    onScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobUriArray]);

  useEffect(() => {
    return () => {
      timeoutID.current && window.clearTimeout(timeoutID.current);
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
      {panelResizing ? (
        <div className='ImagesPanel__resizing'>
          <Text size={14} color='info'>
            Release to resize
          </Text>
        </div>
      ) : (
        <>
          <div className='ImagesPanel'>
            {!isEmpty(imagesData) ? (
              <div className='ImagesPanel__imagesContainer'>
                <ImagesSet
                  data={imagesData}
                  imagesBlobs={imagesBlobs}
                  onScroll={onScroll}
                  addUriToList={addUriToList}
                  imagesSetKey={imagesSetKey}
                  imageSetWrapperHeight={imageWrapperOffsetHeight - 40}
                  imageSetWrapperWidth={imageWrapperOffsetWidth}
                />
              </div>
            ) : (
              <EmptyComponent
                size='big'
                content="It's super easy to search Aim experiments. Lookup search docs to learn more."
              />
            )}
            {stepRange && indexRange && isRangePanelShow && (
              <ImagesExploreRangePanel
                recordSlice={recordSlice}
                indexSlice={indexSlice}
                indexRange={indexRange}
                stepRange={stepRange}
                indexDensity={indexDensity}
                recordDensity={recordDensity}
                onSliceRangeChange={onSliceRangeChange}
                onDensityChange={onDensityChange}
                applyButtonDisabled={applyButtonDisabled}
              />
            )}
          </div>
        </>
      )}
    </BusyLoaderWrapper>
  );
}

export default ImagesPanel;
