import React from 'react';
import { Grid, PopoverPosition, GridSize, Typography } from '@material-ui/core';
import _ from 'lodash-es';

import chartGridPattern from 'config/chart-grid-pattern/chartGridPattern';
import { chartTypesConfig } from './config';
import { ChartTypeEnum } from 'utils/d3';

import ChartPopover from './ChartPopover/ChartPopover';
import PopoverContent from './PopoverContent/PopoverContent';

import { IChartPanelProps } from 'types/components/ChartPanel/ChartPanel';
import {
  IActivePoint,
  ISyncHoverStateParams,
} from 'types/utils/d3/drawHoverAttributes';

import './ChartPanel.scss';

const ChartPanel = React.forwardRef(function ChartPanel(
  props: IChartPanelProps,
  ref,
) {
  const [chartRefs, setChartsRefs] = React.useState<React.RefObject<any>[]>(
    new Array(props.data.length).fill('*').map(() => React.createRef()),
  );
  const [popoverPosition, setPopoverPosition] =
    React.useState<PopoverPosition | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const activePointRef = React.useRef<IActivePoint | null>(null);

  const onChangePopoverPosition = React.useCallback(
    (pos: PopoverPosition | null) => {
      if (
        props.tooltip.display ||
        props.focusedState.active ||
        props.zoomMode
      ) {
        setPopoverPosition(pos?.top && pos.left ? pos : null);
      }
    },
    [
      props.tooltip.display,
      props.focusedState.active,
      props.zoomMode,
      setPopoverPosition,
    ],
  );

  const syncHoverState = React.useCallback(
    (params: ISyncHoverStateParams): void => {
      const { activePoint, focusedStateActive, dataSelector } = params;
      // on MouseHover
      activePointRef.current = activePoint;
      if (activePoint !== null) {
        if (props.chartType !== ChartTypeEnum.HighPlot) {
          chartRefs.forEach((chartRef, index) => {
            if (index === activePoint.chartIndex) {
              return;
            }
            chartRef.current?.updateHoverAttributes?.(
              activePoint.xValue,
              dataSelector,
            );
          });
        }

        if (props.onActivePointChange) {
          props.onActivePointChange(activePoint, focusedStateActive);
        }

        onChangePopoverPosition({
          top: activePoint.topPos - (containerRef.current?.scrollTop || 0),
          left: activePoint.leftPos - (containerRef.current?.scrollLeft || 0),
        });
      }
      // on MouseLeave
      else {
        chartRefs.forEach((chartRef) => {
          chartRef.current?.clearHoverAttributes?.();
        });
        onChangePopoverPosition(null);
      }
    },
    [
      chartRefs,
      props.chartType,
      props.onActivePointChange,
      onChangePopoverPosition,
    ],
  );

  const onScroll = React.useCallback((): void => {
    if (popoverPosition) {
      onChangePopoverPosition({
        top:
          (activePointRef.current?.topPos || 0) -
          (containerRef.current?.scrollTop || 0),
        left:
          (activePointRef.current?.leftPos || 0) -
          (containerRef.current?.scrollLeft || 0),
      });
    }
  }, [popoverPosition, onChangePopoverPosition]);

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
    !props.panelResizing &&
      chartRefs.forEach((chartRef) => {
        chartRef.current?.setFocusedState?.(props.focusedState);
      });
  }, [chartRefs, props.focusedState, props.panelResizing]);

  React.useEffect(() => {
    const debouncedScroll = _.debounce(onScroll, 100);
    const containerNode = containerRef.current;
    containerNode?.addEventListener('scroll', debouncedScroll);
    return () => {
      containerNode?.removeEventListener('scroll', debouncedScroll);
    };
  }, [onScroll]);

  return (
    <Grid container className='ChartPanel__container'>
      <Grid item xs className='ChartPanel'>
        {props.panelResizing ? (
          <div className='ChartPanel__resizing'>
            <Typography variant='subtitle1' color='primary'>
              Release to resize
            </Typography>
          </div>
        ) : (
          <Grid
            ref={containerRef}
            container
            className='ChartPanel__paper__grid'
          >
            {props.data.map((chartData: any, index: number) => {
              const Component = chartTypesConfig[props.chartType];
              const aggregatedData = props.aggregatedData?.filter(
                (data) => data.chartIndex === index,
              );
              const title =
                props.data.length > 1 && props.chartTitleData
                  ? props.chartTitleData[index]
                  : {};
              return (
                <Grid
                  key={index}
                  item
                  className='ChartPanel__paper__grid__chartBox'
                  xs={
                    props.data.length > 9
                      ? 4
                      : (chartGridPattern[props.data.length][index] as GridSize)
                  }
                >
                  <Component
                    ref={chartRefs[index]}
                    // TODO change props.chartProps[0] to props.chartProps
                    {...props.chartProps[0]}
                    index={index}
                    data={chartData}
                    title={title}
                    aggregatedData={aggregatedData}
                    aggregationConfig={props.aggregationConfig}
                    alignmentConfig={props.alignmentConfig}
                    syncHoverState={syncHoverState}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
        <ChartPopover
          popoverPosition={popoverPosition}
          open={
            props.data.length > 0 &&
            !props.panelResizing &&
            !props.zoomMode &&
            (props.tooltip.display || props.focusedState.active)
          }
          containerRef={containerRef}
        >
          <PopoverContent
            chartType={props.chartType}
            tooltipContent={props.tooltip.content}
            focusedState={props.focusedState}
            alignmentConfig={props.alignmentConfig}
          />
        </ChartPopover>
      </Grid>
      <Grid className='Metrics__controls__container' item>
        {props.controls}
      </Grid>
    </Grid>
  );
});

export default ChartPanel;
