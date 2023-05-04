import React from 'react';
import _ from 'lodash-es';

import MediaSet from 'components/MediaSet/MediaSet';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import { Text } from 'components/kit';
import ChartPopover from 'components/ChartPanel/ChartPopover/ChartPopover';
import { throttle } from 'components/Table/utils';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import { BATCH_SEND_DELAY } from 'config/mediaConfigs/mediaConfigs';
import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

import blobsURIModel from 'services/models/media/blobsURIModel';

import { IMediaPanelProps } from './MediaPanel.d';

import './MediaPanel.scss';

function MediaPanel({
  data,
  isLoading,
  panelResizing,
  wrapperOffsetHeight,
  wrapperOffsetWidth,
  orderedMap,
  resizeMode,
  tooltip,
  focusedState,
  additionalProperties,
  tableHeight,
  mediaType,
  controls,
  actionPanel,
  actionPanelSize,
  tooltipType,
  onActivePointChange,
  getBlobsData,
  sortFieldsDict,
  sortFields,
  illustrationConfig,
  onChangeTooltip = () => {},
  selectOptions = [],
  onRunsTagsChange = () => {},
}: IMediaPanelProps): React.FunctionComponentElement<React.ReactNode> {
  const [activePointRect, setActivePointRect] = React.useState<{
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null>(null);
  const [encodedDataKey, setEncodedDataKey] = React.useState<string>('');
  const [encodedSortFieldsDictKey, setEncodedSortFieldsDictKey] =
    React.useState<string>('');
  let processedBlobUriArray = React.useRef<string[]>([]);
  let blobUriArray = React.useRef<string[]>([]);
  let timeoutID = React.useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const activePointRef = React.useRef<any>(null);
  const requestRef = React.useRef<any>();
  const scrollTopOffset = React.useRef<number>(0);
  const rafMouseOverId = React.useRef<number>(0);

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

  const closePopover = React.useCallback((): void => {
    if (focusedState?.key || activePointRect) {
      if (rafMouseOverId.current) {
        window.cancelAnimationFrame(rafMouseOverId.current);
      }
      syncHoverState({ activePoint: null });
    }
  }, [focusedState?.key, activePointRect, syncHoverState]);

  const onMouseOver = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (e) {
        e.stopPropagation();
        if (e.target) {
          rafMouseOverId.current = window.requestAnimationFrame(() => {
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
          });
        }
      }
    },
    [
      focusedState?.key,
      focusedState?.active,
      activePointRect,
      syncHoverState,
      closePopover,
    ],
  );

  function omitRunPropertyFromData(data: any) {
    if (_.isArray(data)) {
      return data.map((item: any) => _.omit(item, 'run'));
    } else {
      return Object.keys(data ?? []).reduce((acc: any, key: any) => {
        acc[key] = omitRunPropertyFromData(data[key]);
        return acc;
      }, {});
    }
  }

  React.useEffect(() => {
    const resultEncodedDataKey = JSON.stringify(omitRunPropertyFromData(data));
    if (encodedDataKey !== resultEncodedDataKey) {
      setEncodedDataKey(resultEncodedDataKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  React.useEffect(() => {
    const resultEncodedSortFieldsDictKey = JSON.stringify(sortFieldsDict);
    if (encodedSortFieldsDictKey !== resultEncodedSortFieldsDictKey) {
      setEncodedSortFieldsDictKey(resultEncodedSortFieldsDictKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortFieldsDict]);

  const mediaSetKey = React.useMemo(
    () => {
      return Date.now();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      encodedDataKey,
      wrapperOffsetHeight,
      wrapperOffsetWidth,
      additionalProperties,
      encodedSortFieldsDictKey,
    ],
  );

  function addUriToList(blobUrl: string) {
    if (blobsURIModel.getState()[blobUrl]) {
      return;
    }
    if (blobUriArray.current.includes(blobUrl)) {
      return;
    }
    if (processedBlobUriArray.current.includes(blobUrl)) {
      return;
    }

    blobUriArray.current.push(blobUrl);
    getBatch();
  }

  const getBatch = throttle(() => {
    if (timeoutID.current) {
      window.clearTimeout(timeoutID.current);
    }
    timeoutID.current = window.setTimeout(() => {
      if (!_.isEmpty(blobUriArray.current)) {
        const processingBlobUriArray = Object.assign([], blobUriArray.current);
        blobUriArray.current = [];
        processedBlobUriArray.current = [
          ...new Set([
            ...processedBlobUriArray.current,
            ...processingBlobUriArray,
          ]),
        ];
        requestRef.current = getBlobsData(processingBlobUriArray);
        requestRef.current.call().catch((err: any) => {
          processedBlobUriArray.current = processedBlobUriArray.current.filter(
            (uri: string) => !processingBlobUriArray.includes(uri),
          );
        });
      }
    }, BATCH_SEND_DELAY);
  }, BATCH_SEND_DELAY);

  function onListScroll({ scrollOffset }: { scrollOffset: number }): void {
    if (Math.abs(scrollOffset - scrollTopOffset.current) > window.innerHeight) {
      if (requestRef.current) {
        requestRef.current.abort();
      }
    }
    scrollTopOffset.current = scrollOffset;
    closePopover();
  }

  React.useEffect(() => {
    document.addEventListener('mouseover', closePopover);
    return () => {
      document.removeEventListener('mouseover', closePopover);
    };
  }, [closePopover]);

  React.useEffect(() => {
    return () => {
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
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isLoading}
        className='MediaPanel__loader'
        height='100%'
        loaderComponent={<ChartLoader controlsCount={4} />}
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
              {!_.isEmpty(data) ? (
                <div
                  className='MediaPanel'
                  style={{ height: `calc(100% - ${actionPanelSize || 0})` }}
                >
                  <div
                    ref={containerRef}
                    className='MediaPanel__mediaSetContainer'
                    onMouseOver={onMouseOver}
                  >
                    <ErrorBoundary>
                      <MediaSet
                        data={data}
                        onListScroll={onListScroll}
                        addUriToList={addUriToList}
                        mediaSetKey={mediaSetKey}
                        sortFieldsDict={sortFieldsDict}
                        wrapperOffsetHeight={wrapperOffsetHeight}
                        wrapperOffsetWidth={wrapperOffsetWidth}
                        focusedState={focusedState}
                        orderedMap={orderedMap}
                        additionalProperties={additionalProperties}
                        tableHeight={tableHeight}
                        tooltip={tooltip}
                        mediaType={mediaType}
                        sortFields={sortFields}
                        selectOptions={selectOptions}
                        onRunsTagsChange={onRunsTagsChange}
                      />
                    </ErrorBoundary>
                  </div>
                  {tooltipType && (
                    <ErrorBoundary>
                      <ChartPopover
                        key={'popover-' + tooltipType}
                        containerNode={containerRef.current}
                        activePointRect={activePointRect}
                        open={
                          resizeMode !== ResizeModeEnum.MaxHeight &&
                          !panelResizing &&
                          !!tooltip?.display
                        }
                        forceOpen={!!focusedState?.active}
                        chartType={tooltipType}
                        tooltipContent={tooltip?.content || {}}
                        tooltipAppearance={tooltip?.appearance}
                        focusedState={focusedState}
                        selectOptions={selectOptions}
                        onRunsTagsChange={onRunsTagsChange}
                        onChangeTooltip={onChangeTooltip}
                      />
                    </ErrorBoundary>
                  )}
                  {controls && (
                    <ErrorBoundary>
                      <div className='MediaPanel__controls ScrollBar__hidden'>
                        {controls}
                      </div>
                    </ErrorBoundary>
                  )}
                </div>
              ) : (
                <IllustrationBlock
                  page={illustrationConfig?.page || 'runs'}
                  type={illustrationConfig?.type || IllustrationsEnum.EmptyData}
                  size={illustrationConfig?.size || 'xLarge'}
                  title={illustrationConfig?.title || ''}
                />
              )}
              {actionPanel}
            </div>
          </>
        )}
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

export default React.memo(MediaPanel);
