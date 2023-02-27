import React from 'react';
import _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import SplitPane, { SplitPaneItem } from 'components/SplitPane';

import { ResizeModeEnum } from 'config/enums/tableEnums';

import { IChartPanelProps } from 'types/components/ChartPanel/ChartPanel';
import {
  IActivePoint,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';

import { ChartTypeEnum } from 'utils/d3';

import ResizingFallback from '../ResizingFallback';

import ChartPopover from './ChartPopover';
import ChartGrid from './ChartGrid';
import ChartLegends from './ChartLegends';

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

  const gridRef = React.useRef<HTMLDivElement>(null);
  const activePointRef = React.useRef<IActivePoint | null>(null);

  const setActiveElemPos = React.useCallback(() => {
    if (
      activePointRef.current &&
      gridRef.current &&
      activePointRef.current?.pointRect !== null
    ) {
      const { pointRect } = activePointRef.current;

      setActivePointRect({ ...pointRect });
    } else {
      setActivePointRect(null);
    }
  }, [setActivePointRect]);

  const syncHoverState = React.useCallback(
    (args: ISyncHoverStateArgs): void => {
      const { activePoint, focusedState, dataSelector } = args;
      // on MouseHover
      activePointRef.current = activePoint;
      if (activePoint !== null) {
        chartRefs.forEach((chartRef, index) => {
          if (focusedState) {
            chartRef.current?.setFocusedState?.(focusedState);
          }
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
          props.onActivePointChange(activePoint, focusedState?.active);
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

  const displayLegends = React.useMemo(
    (): boolean => !!props.legends?.display && !_.isEmpty(props.legendsData),
    [props.legends?.display, props.legendsData],
  );

  const onLegendsResizeStart = React.useCallback((): void => {
    setLegendsResizing(true);
  }, []);

  const onLegendsResizeEnd = React.useCallback((): void => {
    setLegendsResizing(false);
  }, []);

  const onChartMount = React.useCallback(() => {
    if (props.focusedState) {
      chartRefs.forEach((chartRef) => {
        chartRef.current?.setFocusedState?.(props.focusedState);
      });
    }
  }, [props.focusedState, chartRefs]);

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

  return (
    <ErrorBoundary>
      <div className='ChartPanel__container'>
        {props.panelResizing ? (
          <ResizingFallback />
        ) : (
          <>
            <ErrorBoundary>
              <div className='ChartPanel'>
                <SplitPane
                  id={props.chartType}
                  direction='horizontal'
                  minSize={[600, 0]}
                  expandToMin={true}
                  sizes={displayLegends ? [85, 15] : [100, 0]}
                  snapOffset={80}
                  gutterSize={displayLegends ? 4 : 0}
                  useLocalStorage={displayLegends}
                  onDragEnd={onLegendsResizeEnd}
                  onDragStart={onLegendsResizeStart}
                >
                  <SplitPaneItem
                    ref={gridRef}
                    className='ChartPanel__grid'
                    resizingFallback={<ResizingFallback />}
                  >
                    <ChartGrid
                      data={props.data}
                      chartProps={props.chartProps}
                      chartRefs={chartRefs}
                      chartType={props.chartType}
                      syncHoverState={syncHoverState}
                      resizeMode={props.resizeMode}
                      onMount={onChartMount}
                      chartPanelOffsetHeight={props.chartPanelOffsetHeight}
                    />
                    <ErrorBoundary>
                      <ChartPopover
                        key={'popover-' + props.chartType}
                        containerNode={gridRef.current}
                        activePointRect={activePointRect}
                        onRunsTagsChange={props.onRunsTagsChange}
                        open={
                          props.resizeMode !== ResizeModeEnum.MaxHeight &&
                          props.data.length > 0 &&
                          !props.zoom?.active &&
                          !!props.tooltip?.display
                        }
                        forceOpen={!!props.focusedState?.active}
                        chartType={props.chartType}
                        tooltipContent={props?.tooltip?.content || {}}
                        tooltipAppearance={props?.tooltip?.appearance}
                        focusedState={props.focusedState}
                        alignmentConfig={props.alignmentConfig}
                        selectOptions={props.selectOptions}
                        onChangeTooltip={props.onChangeTooltip}
                      />
                    </ErrorBoundary>
                  </SplitPaneItem>
                  <SplitPaneItem hide={!displayLegends}>
                    <ChartLegends
                      data={props.legendsData}
                      mode={props.legends?.mode}
                    />
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
