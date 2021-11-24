import React, { useEffect, useMemo, useRef } from 'react';
import { isEmpty } from 'lodash-es';

import { PopoverPosition } from '@material-ui/core';

import ImagesSet from 'components/ImagesSet/ImagesSet';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import ImagesExploreRangePanel from 'components/ImagesExploreRangePanel';
import { Text } from 'components/kit';
import ChartPopover from 'components/ChartPanel/ChartPopover/ChartPopover';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import {
  batchSendDelay,
  imageFixedHeight,
} from 'config/imagesConfigs/imagesConfig';

import { ChartTypeEnum } from 'utils/d3';

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
  orderedMap,
  controls,
  resizeMode,
  tooltip,
  focusedState,
  onActivePointChange,
}: IImagesPanelProps): React.FunctionComponentElement<React.ReactNode> {
  const [popoverPosition, setPopoverPosition] =
    React.useState<PopoverPosition | null>(null);
  let blobUriArray: string[] = [];
  let timeoutID = useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const activePointRef = React.useRef<any>(null);

  function addUriToList(blobUrl: string) {
    if (!imagesBlobs?.[blobUrl]) {
      blobUriArray.push(blobUrl);
    }
  }

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
    }, batchSendDelay);
  }

  const syncHoverState = React.useCallback(
    (args: any): void => {
      const { activePoint, focusedStateActive = false } = args;
      activePointRef.current = activePoint;
      // on MouseEnter
      if (activePoint !== null) {
        if (onActivePointChange) {
          onActivePointChange(activePoint, focusedStateActive);
        }
        if (activePoint.clientRect) {
          setPopoverPosition({
            top: activePoint.clientRect.top,
            left: activePoint.clientRect.left + activePoint.clientRect.width,
          });
        } else {
          setPopoverPosition(null);
        }
      }
      // on MouseLeave
      else {
        setPopoverPosition(null);
      }
    },
    [onActivePointChange, setPopoverPosition],
  );

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

  return (
    <BusyLoaderWrapper
      isLoading={isLoading}
      className='ImagesExplore__loader'
      height='100%'
      loaderComponent={<ChartLoader controlsCount={0} />}
    >
      {panelResizing ? (
        <div className='ImagesPanel__Container__resizing'>
          <Text size={14} color='info'>
            Release to resize
          </Text>
        </div>
      ) : (
        <>
          <div className='ImagesPanel__Container'>
            {!isEmpty(imagesData) ? (
              <div
                className='ImagesPanel'
                ref={containerRef}
                // TODO
                // onClick={(e) => {
                //   e.stopPropagation();
                //   syncHoverState({
                //     activePoint: activePointRef.current,
                //     focusedStateActive: false,
                //   });
                // }}
                onMouseLeave={() => {
                  if (!focusedState?.active) {
                    setPopoverPosition(null);
                  }
                }}
              >
                <div className='ImagesPanel__imagesSetContainer'>
                  <ImagesSet
                    data={imagesData}
                    imagesBlobs={imagesBlobs}
                    onScroll={onScroll}
                    addUriToList={addUriToList}
                    imagesSetKey={imagesSetKey}
                    imageSetWrapperHeight={imageWrapperOffsetHeight - 40}
                    imageSetWrapperWidth={imageWrapperOffsetWidth}
                    imageHeight={imageFixedHeight}
                    focusedState={focusedState}
                    syncHoverState={syncHoverState}
                    orderedMap={orderedMap}
                  />
                </div>
                <ChartPopover
                  containerRef={containerRef}
                  popoverPosition={popoverPosition}
                  open={
                    resizeMode !== ResizeModeEnum.MaxHeight &&
                    !panelResizing &&
                    (tooltip?.display || focusedState?.active)
                  }
                  chartType={ChartTypeEnum.ImageSet}
                  tooltipContent={tooltip?.content}
                  focusedState={focusedState}
                />
                <div className='ImagesPanel__controls'>{controls}</div>
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

export default React.memo(ImagesPanel);
