import React from 'react';
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
import { ImageAlignmentEnum } from 'config/enums/imageEnums';

import imagesURIModel from 'services/models/imagesExplore/imagesURIModel';

import { ChartTypeEnum } from 'utils/d3';

import { IImagesPanelProps } from './ImagesPanel.d';

import './ImagesPanel.scss';

function ImagesPanel({
  imagesData,
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
  imageProperties,
  onActivePointChange,
  tableHeight,
}: IImagesPanelProps): React.FunctionComponentElement<React.ReactNode> {
  const [activePointRect, setActivePointRect] = React.useState<{
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null>(null);
  let blobUriArray = React.useRef<string[]>([]);
  let timeoutID = React.useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const activePointRef = React.useRef<any>(null);
  const requestRef = React.useRef<any>();
  const scrollTopOffset = React.useRef<number>(0);

  function addUriToList(blobUrl: string) {
    if (!imagesURIModel.getState()[blobUrl]) {
      blobUriArray.current.push(blobUrl);
    }
  }

  function onScroll() {
    if (timeoutID.current) {
      window.clearTimeout(timeoutID.current);
    }

    timeoutID.current = window.setTimeout(() => {
      if (!isEmpty(blobUriArray.current)) {
        requestRef.current = getImagesBlobsData(blobUriArray.current);
        requestRef.current.call().then(() => {
          blobUriArray.current = [];
        });
      }
    }, batchSendDelay);
  }

  function onListScroll({ scrollOffset }: { scrollOffset: number }): void {
    if (Math.abs(scrollOffset - scrollTopOffset.current) > window.innerHeight) {
      if (requestRef.current) {
        requestRef.current.abort();
      }
    }
    scrollTopOffset.current = scrollOffset;
    closePopover();
  }

  function closePopover(): void {
    if (!focusedState?.active) {
      syncHoverState({ activePoint: null });
    }
  }

  function onMouseOver(e: React.MouseEvent<HTMLDivElement>): void {
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

  const imagesSetKey = React.useMemo(
    () => Date.now(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      imagesData,
      imageWrapperOffsetHeight,
      imageWrapperOffsetWidth,
      imageProperties,
    ],
  );

  React.useEffect(() => {
    onScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobUriArray.current]);

  React.useEffect(() => {
    document.addEventListener('mouseover', closePopover);

    return () => {
      document.removeEventListener('mouseover', closePopover);

      if (timeoutID.current) {
        window.clearTimeout(timeoutID.current);
      }

      if (requestRef.current) {
        requestRef.current.abort();
      }

      imagesURIModel.init();
    };
  }, []);

  return (
    <BusyLoaderWrapper
      isLoading={isLoading}
      className='ImagesExplore__loader'
      height='100%'
      loaderComponent={<ChartLoader controlsCount={2} />}
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
                    onScroll={onScroll}
                    onListScroll={onListScroll}
                    addUriToList={addUriToList}
                    imagesSetKey={imagesSetKey}
                    imageSetWrapperHeight={imageWrapperOffsetHeight - 48}
                    imageSetWrapperWidth={imageWrapperOffsetWidth}
                    imageHeight={
                      imageProperties?.alignmentType ===
                      ImageAlignmentEnum.Height
                        ? (imageWrapperOffsetHeight *
                            imageProperties?.imageSize) /
                          100
                        : imageProperties?.alignmentType ===
                          ImageAlignmentEnum.Width
                        ? (imageWrapperOffsetWidth *
                            imageProperties?.imageSize) /
                          100
                        : imageFixedHeight
                    }
                    focusedState={focusedState}
                    syncHoverState={syncHoverState}
                    orderedMap={orderedMap}
                    imageProperties={imageProperties}
                    tableHeight={tableHeight}
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
