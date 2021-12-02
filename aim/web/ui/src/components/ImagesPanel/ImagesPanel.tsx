import React, { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
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
  const [activePointRect, setActivePointRect] = useState<{
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null>(null);
  let blobUriArray = useRef<string[]>([]);
  let timeoutID = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const activePointRef = useRef<any>(null);
  const collectedURIs = useRef<{ [key: string]: boolean }>({});

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

  function onListScroll(): void {
    closePopover();
  }

  function closePopover(): void {
    if (!focusedState?.active) {
      syncHoverState({ activePoint: null });
    }
  }

  function onMouseOver(e: MouseEvent<HTMLDivElement>): void {
    if (e?.target) {
      e.stopPropagation();
      const targetElem = e.target as Element;
      const closestImageNode = targetElem.closest(
        '.ImagesSet__container__imagesBox__imageBox__image',
      );
      if (closestImageNode) {
        const imageKey = closestImageNode.getAttribute('data-key');
        const imageSeqKey = closestImageNode.getAttribute('data-seqkey');
        const pointRect = closestImageNode.getBoundingClientRect();
        if (
          pointRect &&
          (focusedState.key !== imageKey || activePointRect === null) &&
          !focusedState?.active
        ) {
          syncHoverState({
            activePoint: { pointRect, key: imageKey, seqKey: imageSeqKey },
          });
        }
      } else {
        closePopover();
      }
    }
  }

  const setActiveElemPos = React.useCallback(() => {
    if (activePointRef.current && containerRef.current) {
      const { pointRect } = activePointRef.current;
      setActivePointRect({
        bottom: pointRect.bottom,
        right: pointRect.right,
        top: pointRect.top,
        left: pointRect.left,
      });
    } else {
      setActivePointRect(null);
    }
  }, [setActivePointRect, activePointRef.current, containerRef.current]);

  const syncHoverState = React.useCallback(
    (args: any): void => {
      const { activePoint, focusedStateActive = false } = args;
      activePointRef.current = activePoint;
      // on MouseEnter
      if (activePoint !== null) {
        if (onActivePointChange) {
          onActivePointChange(activePoint, focusedStateActive);
        }
        setActiveElemPos();
      }
      // on MouseLeave
      else {
        setActivePointRect(null);
        // TODO remove after implementing active focusedState logic
        if (onActivePointChange) {
          onActivePointChange({ key: null }, focusedStateActive);
        }
      }
    },
    [onActivePointChange, setActivePointRect, setActiveElemPos],
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
    document.addEventListener('mouseover', closePopover);
    return () => {
      document.removeEventListener('mouseover', closePopover);
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
              <div className='ImagesPanel'>
                <div
                  ref={containerRef}
                  className='ImagesPanel__imagesSetContainer'
                  onMouseOver={onMouseOver}
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
                    onListScroll={onListScroll}
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
                  activePointRect={activePointRect}
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
