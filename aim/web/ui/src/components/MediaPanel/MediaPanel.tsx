import React from 'react';
import { isEmpty } from 'lodash-es';

import MediaSet from 'components/MediaSet/MediaSet';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import { Text } from 'components/kit';
import ChartPopover from 'components/ChartPanel/ChartPopover/ChartPopover';
import { throttle } from 'components/Table/utils';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import {
  batchSendDelay,
  imageFixedHeight,
} from 'config/imagesConfigs/imagesConfig';
import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

import blobsURIModel from 'services/models/media/blobsURIModel';

import { IMediaPanelProps } from './MediaPanel.d';

import './MediaPanel.scss';

function MediaPanel({
  data,
  getBlobsData,
  isLoading,
  panelResizing,
  wrapperOffsetHeight,
  wrapperOffsetWidth,
  orderedMap,
  resizeMode,
  tooltip,
  focusedState,
  additionalProperties,
  onActivePointChange,
  tableHeight,
  mediaType,
  controls,
  actionPanel,
  actionPanelSize,
  tooltipType,
}: IMediaPanelProps): React.FunctionComponentElement<React.ReactNode> {
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
    if (!blobsURIModel.getState()[blobUrl]) {
      blobUriArray.current.push(blobUrl);
      getBatch();
    }
  }

  const getBatch = throttle(() => {
    if (timeoutID.current) {
      window.clearTimeout(timeoutID.current);
    }

    timeoutID.current = window.setTimeout(() => {
      if (!isEmpty(blobUriArray.current)) {
        requestRef.current = getBlobsData(blobUriArray.current);
        requestRef.current.call().then(() => {
          blobUriArray.current = [];
        });
      }
    }, batchSendDelay);
  }, batchSendDelay);

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
      const closestNode = targetElem.closest(
        '[data-mediasetitem="mediaSetItem"]',
      );
      if (closestNode) {
        const key = closestNode.getAttribute('data-key');
        const seqKey = closestNode.getAttribute('data-seqkey');
        const pointRect = closestNode.getBoundingClientRect();
        if (
          pointRect &&
          (focusedState.key !== key || activePointRect === null) &&
          !focusedState?.active
        ) {
          syncHoverState({
            activePoint: { pointRect, key, seqKey },
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
  }, [setActivePointRect]);

  const syncHoverState = React.useCallback(
    (args: {
      activePoint: object | null;
      focusedStateActive?: boolean;
    }): void => {
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

  const setKey = React.useMemo(
    () => Date.now(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, wrapperOffsetHeight, wrapperOffsetWidth, additionalProperties],
  );

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

      blobsURIModel.init();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BusyLoaderWrapper
      isLoading={isLoading}
      className='MediaPanel__loader'
      height='100%'
      loaderComponent={<ChartLoader controlsCount={2} />}
    >
      {panelResizing ? (
        <div className='MediaPanel__Container__resizing'>
          <Text size={14} color='info'>
            Release to resize
          </Text>
        </div>
      ) : (
        <>
          <div className='MediaPanel__Container'>
            {!isEmpty(data) ? (
              <div
                className='MediaPanel'
                style={{ height: `calc(100% - ${actionPanelSize || 0})` }}
              >
                <div
                  ref={containerRef}
                  className='MediaPanel__mediaSetContainer'
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
                  <MediaSet
                    data={data}
                    onListScroll={onListScroll}
                    addUriToList={addUriToList}
                    setKey={setKey}
                    wrapperOffsetHeight={wrapperOffsetHeight - 48}
                    wrapperOffsetWidth={wrapperOffsetWidth}
                    mediaItemHeight={
                      additionalProperties?.alignmentType ===
                      MediaItemAlignmentEnum.Height
                        ? (wrapperOffsetHeight *
                            additionalProperties?.mediaItemSize) /
                          100
                        : additionalProperties?.alignmentType ===
                          MediaItemAlignmentEnum.Width
                        ? (wrapperOffsetWidth *
                            additionalProperties?.mediaItemSize) /
                          100
                        : imageFixedHeight
                    }
                    focusedState={focusedState}
                    syncHoverState={syncHoverState}
                    orderedMap={orderedMap}
                    additionalProperties={additionalProperties}
                    tableHeight={tableHeight}
                    tooltip={tooltip}
                    mediaType={mediaType}
                  />
                </div>
                {tooltipType && (
                  <ChartPopover
                    containerNode={containerRef.current}
                    activePointRect={activePointRect}
                    open={
                      resizeMode !== ResizeModeEnum.MaxHeight &&
                      !panelResizing &&
                      (tooltip?.display || focusedState?.active)
                    }
                    chartType={tooltipType}
                    tooltipContent={tooltip?.content}
                    focusedState={focusedState}
                  />
                )}
                {controls && (
                  <div className='MediaPanel__controls'>{controls}</div>
                )}
              </div>
            ) : (
              <EmptyComponent
                size='big'
                content="It's super easy to search Aim experiments. Lookup search docs to learn more."
              />
            )}
            {actionPanel}
          </div>
        </>
      )}
    </BusyLoaderWrapper>
  );
}

export default React.memo(MediaPanel);
