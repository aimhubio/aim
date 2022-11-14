import React from 'react';
import _ from 'lodash-es';
import { marked } from 'marked';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import SplitPane, { SplitPaneItem } from 'components/SplitPane';

import { ResizeModeEnum } from 'config/enums/tableEnums';

import { IChartPanelProps } from 'types/components/ChartPanel/ChartPanel';
import {
  IActivePoint,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';

import { ChartTypeEnum } from 'utils/d3';

import ChartPopover from './ChartPopover';
import ChartGrid from './ChartGrid';
import ChartLegends from './ChartLegends';
import ChartPanelResizingFallback from './ChartPanelResizingFallback';

import './ChartPanel.scss';

const ChartPanel = React.forwardRef(function ChartPanel(
  props: IChartPanelProps,
  ref,
) {
  const [chartRefs] = React.useState<React.RefObject<any>[]>(
    new Array(props.data.length).fill('*').map(() => React.createRef()),
  );
  const [activePointRect, setActivePointRect] = React.useState<{
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null>(null);
  const [legendsResizing, setLegendsResizing] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const activePointRef = React.useRef<IActivePoint | null>(null);

  const setActiveElemPos = React.useCallback(() => {
    if (
      activePointRef.current &&
      containerRef.current &&
      activePointRef.current?.pointRect !== null
    ) {
      const { pointRect } = activePointRef.current;

      setActivePointRect({
        ...pointRect,
        top: pointRect.top - containerRef.current.scrollTop,
        left: pointRect.left - containerRef.current.scrollLeft,
      });
    } else {
      setActivePointRect(null);
    }
  }, [setActivePointRect]);

  const syncHoverState = React.useCallback(
    (args: ISyncHoverStateArgs): void => {
      const { activePoint, focusedStateActive = false, dataSelector } = args;
      // on MouseHover
      activePointRef.current = activePoint;
      if (activePoint !== null) {
        chartRefs.forEach((chartRef, index) => {
          chartRef.current?.setFocusedState?.({
            active: focusedStateActive,
            key: activePoint.key,
            xValue: activePoint.xValue,
            yValue: activePoint.yValue,
            chartIndex: activePoint.chartIndex,
          });
          if (index === activePoint.chartIndex) {
            return;
          }
          switch (props.chartType) {
            case ChartTypeEnum.LineChart:
              chartRef.current?.updateHoverAttributes?.(
                activePoint.xValue,
                dataSelector,
              );
              break;
            case ChartTypeEnum.HighPlot:
              chartRef.current?.clearHoverAttributes?.();
              break;
          }
        });

        if (props.onActivePointChange) {
          props.onActivePointChange(activePoint, focusedStateActive);
        }
        if (activePoint.pointRect !== null) {
          setActiveElemPos();
        } else {
          setActivePointRect(null);
        }
      }
      // on MouseLeave
      else {
        chartRefs.forEach((chartRef) => {
          chartRef.current?.clearHoverAttributes?.();
        });
        setActivePointRect(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chartRefs, setActiveElemPos, props.chartType, props.onActivePointChange],
  );

  const onScroll = React.useCallback((): void => {
    if (activePointRect) {
      setActiveElemPos();
    }
  }, [activePointRect, setActiveElemPos]);

  const displayLegends = React.useMemo(
    (): boolean => !!props.legends?.display && !_.isEmpty(props.legendsData),
    [props.legends?.display, props.legendsData],
  );

  const onLegendsResizeStart = React.useCallback((): void => {
    setLegendsResizing(true);
  }, []);

  const onLegendsResizeEnd = React.useCallback(
    (sizes: number[]): void => {
      props.onLegendsChange?.({ width: sizes[1] });
      setLegendsResizing(false);
    },
    [props.onLegendsChange],
  );

  React.useImperativeHandle(ref, () => ({
    setActiveLineAndCircle: (
      lineKey?: string,
      focusedStateActive: boolean = false,
      force: boolean = false,
    ) => {
      chartRefs.forEach((chartRef) => {
        chartRef.current?.setActiveLineAndCircle?.(
          lineKey,
          focusedStateActive,
          force,
        );
      });
    },
  }));

  React.useEffect(() => {
    if (!props.panelResizing && props.focusedState) {
      chartRefs.forEach((chartRef) => {
        chartRef.current?.setFocusedState?.(props.focusedState);
      });
    }
  }, [
    chartRefs,
    props.focusedState,
    props.panelResizing,
    props.resizeMode,
    legendsResizing,
  ]);

  React.useEffect(() => {
    const debouncedScroll = _.debounce(onScroll, 100);
    const containerNode = containerRef.current;
    containerNode?.addEventListener('scroll', debouncedScroll);
    return () => {
      containerNode?.removeEventListener('scroll', debouncedScroll);
    };
  }, [onScroll]);

  return (
    <ErrorBoundary>
      <div className='ChartPanel__container'>
        {props.panelResizing ? (
          <ChartPanelResizingFallback />
        ) : (
          <>
            <ErrorBoundary>
              <div className='ChartPanel'>
                <SplitPane
                  minSize={0}
                  sizes={
                    displayLegends
                      ? [100 - props.legends?.width!, props.legends?.width!]
                      : [100, 0]
                  }
                  gutterSize={displayLegends ? 8 : 0}
                  resizing={legendsResizing}
                  onDragStart={onLegendsResizeStart}
                  onDragEnd={onLegendsResizeEnd}
                >
                  <SplitPaneItem
                    index={0}
                    ref={containerRef}
                    className='ChartPanel__grid'
                    resizingFallback={<ChartPanelResizingFallback />}
                  >
                    <ChartGrid
                      data={props.data}
                      chartProps={props.chartProps}
                      chartRefs={chartRefs}
                      chartType={props.chartType}
                      syncHoverState={syncHoverState}
                      resizeMode={props.resizeMode}
                      chartPanelOffsetHeight={props.chartPanelOffsetHeight}
                    />
                    <ErrorBoundary>
                      <ChartPopover
                        containerNode={containerRef.current}
                        activePointRect={activePointRect}
                        onRunsTagsChange={props.onRunsTagsChange}
                        open={
                          props.resizeMode !== ResizeModeEnum.MaxHeight &&
                          props.data.length > 0 &&
                          !props.zoom?.active &&
                          (props.tooltip?.display || props.focusedState.active)
                        }
                        chartType={props.chartType}
                        tooltipContent={props?.tooltip?.content || {}}
                        tooltipAppearance={props?.tooltip?.appearance}
                        focusedState={props.focusedState}
                        alignmentConfig={props.alignmentConfig}
                        reCreatePopover={props.focusedState.active}
                        selectOptions={props.selectOptions}
                        onChangeTooltip={props.onChangeTooltip}
                      />
                    </ErrorBoundary>
                  </SplitPaneItem>
                  <SplitPaneItem index={1}>
                    {displayLegends && (
                      <ChartLegends
                        data={props.legendsData}
                        mode={props.legends?.mode}
                      />
                    )}
                  </SplitPaneItem>
                </SplitPane>
              </div>
            </ErrorBoundary>
            <ErrorBoundary>
              <div className='ChartPanel__controls ScrollBar__hidden'>
                {props.controls}
              </div>
            </ErrorBoundary>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
});

export default ChartPanel;
