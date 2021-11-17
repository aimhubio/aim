import React, { useEffect, useMemo, useRef, useState } from 'react';
import { isEmpty } from 'lodash-es';

import ImagesSet from 'components/ImagesSet/ImagesSet';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import ImagesExploreRangePanel from 'components/ImagesExploreRangePanel';
import { Text } from 'components/kit';

import useResizeObserver from 'hooks/window/useResizeObserver';

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
  imagesWrapperRef,
  panelResizing,
}: IImagesPanelProps): React.FunctionComponentElement<React.ReactNode> {
  let timeoutID = useRef(0);
  let blobUriArray: string[] = [];
  const [offsetWidth, setOffsetWidth] = useState(
    imagesWrapperRef?.current?.offsetWidth,
  );

  useResizeObserver(
    () => setOffsetWidth(imagesWrapperRef?.current?.offsetWidth),
    imagesWrapperRef,
  );

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
      imagesWrapperRef?.current?.offsetHeight,
      imagesWrapperRef?.current?.offsetWidth,
    ],
  );

  useEffect(() => {
    setOffsetWidth(imagesWrapperRef?.current?.offsetWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesWrapperRef?.current?.offsetWidth]);

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
                  title={'root'}
                  imagesBlobs={imagesBlobs}
                  onScroll={onScroll}
                  addUriToList={addUriToList}
                  imagesSetKey={imagesSetKey}
                  imageSetWrapperHeight={
                    imagesWrapperRef?.current?.offsetHeight - 36
                  }
                  imageSetWrapperWidth={offsetWidth}
                />
              </div>
            ) : (
              <EmptyComponent
                size='big'
                content="It's super easy to search Aim experiments. Lookup search docs to learn more."
              />
            )}
            {stepRange && indexRange && (
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
