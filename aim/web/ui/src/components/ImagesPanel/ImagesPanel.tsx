import React, { MouseEvent, useEffect, useMemo, useRef } from 'react';
import { isEmpty } from 'lodash-es';

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
  const [hoveredElemRect, setHoveredElemRect] = React.useState<DOMRect | null>(
    null,
  );
  let blobUriArray = useRef<string[]>([]);
  let timeoutID = useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const activePointRef = React.useRef<any>(null);
  const collectedURIs = React.useRef<{ [key: string]: boolean }>({});

  function addUriToList(blobUrl: string) {
    if (!imagesBlobs?.[blobUrl]) {
      if (!collectedURIs.current[blobUrl]) {
        collectedURIs.current[blobUrl] = true;
        blobUriArray.current.push(blobUrl);
      }
    }
  }

  function onScroll() {
    if (timeoutID.current) {
      window.clearTimeout(timeoutID.current);
    }
    timeoutID.current = window.setTimeout(() => {
      if (!isEmpty(blobUriArray.current)) {
        getImagesBlobsData(blobUriArray.current).then(() => {
          blobUriArray.current = [];
        });
      }
    }, batchSendDelay);
  }

  function closePopover(e: MouseEvent<HTMLDivElement>): void {
    e?.stopPropagation();
    if (!focusedState?.active) {
      setHoveredElemRect(null);
    }
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
          setHoveredElemRect(activePoint.clientRect);
        } else {
          setHoveredElemRect(null);
        }
      }
      // on MouseLeave
      else {
        setHoveredElemRect(null);
      }
    },
    [onActivePointChange, setHoveredElemRect],
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
  }, [blobUriArray.current]);

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
          <div className='ImagesPanel__Container' onMouseMove={closePopover}>
            {!isEmpty(imagesData) ? (
              <div className='ImagesPanel'>
                <div
                  ref={containerRef}
                  className='ImagesPanel__imagesSetContainer'
                  // TODO
                  // onClick={(e) => {
                  //   e.stopPropagation();
                  //   syncHoverState({
                  //     activePoint: activePointRef.current,
                  //     focusedStateActive: false,
                  //   });
                  // }}
                >
                  <ImagesSet
                    data={imagesData}
                    imagesBlobs={imagesBlobs}
                    onScroll={onScroll}
                    addUriToList={addUriToList}
                    imagesSetKey={imagesSetKey}
                    imageSetWrapperHeight={imageWrapperOffsetHeight - 48}
                    imageSetWrapperWidth={imageWrapperOffsetWidth}
                    imageHeight={imageFixedHeight}
                    focusedState={focusedState}
                    syncHoverState={syncHoverState}
                    orderedMap={orderedMap}
                  />
                </div>
                <ChartPopover
                  containerNode={containerRef.current}
                  hoveredElemRect={hoveredElemRect}
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
