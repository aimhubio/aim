import React from 'react';
import { Grid, Paper, PopoverPosition } from '@material-ui/core';
import { debounce } from 'lodash-es';

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

  const syncHoverState = React.useCallback(
    (params: ISyncHoverStateParams): void => {
      const { activePoint, focusedStateActive } = params;
      // on MouseHover
      activePointRef.current = activePoint;
      if (activePoint !== null) {
        if (props.chartType !== ChartTypeEnum.HighPlot) {
          chartRefs.forEach((chartRef, index) => {
            if (index === activePoint.chartIndex) {
              return;
            }
            chartRef.current?.updateHoverAttributes?.(activePoint.xValue);
          });
        }

        if (props.onActivePointChange) {
          props.onActivePointChange(activePoint, focusedStateActive);
        }

        setPopoverPosition({
          top: activePoint.topPos - (containerRef.current?.scrollTop || 0),
          left: activePoint.leftPos - (containerRef.current?.scrollLeft || 0),
        });
      }
      // on MouseLeave
      else {
        chartRefs.forEach((chartRef) => {
          chartRef.current?.clearHoverAttributes?.();
        });
        setPopoverPosition(null);
      }
    },
    [chartRefs, props],
  );

  const onScroll = React.useCallback((): void => {
    setPopoverPosition((prevState) => {
      return prevState
        ? {
            top:
              (activePointRef.current?.topPos || 0) -
              (containerRef.current?.scrollTop || 0),
            left:
              (activePointRef.current?.leftPos || 0) -
              (containerRef.current?.scrollLeft || 0),
          }
        : null;
    });
  }, []);

  React.useImperativeHandle(ref, () => ({
    setActiveLine: (lineKey: string) => {
      chartRefs.forEach((chartRef) => {
        chartRef.current?.setActiveLine?.(lineKey);
      });
    },
  }));

  React.useEffect(() => {
    chartRefs.forEach((chartRef) => {
      chartRef.current?.setFocusedState?.(props.focusedState);
    });
  }, [chartRefs, props.focusedState]);

  // TODO: remove setTimeout
  React.useEffect(() => {
    setTimeout(() => {
      setChartsRefs((refs) => [...refs]);
    });
  }, []);

  React.useEffect(() => {
    const debouncedScroll = debounce(onScroll, 100);
    const containerNode = containerRef.current;
    containerNode?.addEventListener('scroll', debouncedScroll);
    return () => {
      containerNode?.removeEventListener('scroll', debouncedScroll);
    };
  }, [onScroll]);

  return (
    <Grid container spacing={1} className='ChartPanel__container'>
      <Grid item xs className='ChartPanel'>
        <Paper className='ChartPanel__paper'>
          <Grid
            ref={containerRef}
            container
            spacing={1}
            className='ChartPanel__paper__grid'
          >
            {props.data.map((chartData: any, index: number) => {
              const Component = chartTypesConfig[props.chartType];
              const aggregatedData = props.aggregatedData?.filter(
                (data) => data.chartIndex === index,
              );
              return (
                <Grid
                  key={index}
                  item
                  xs={
                    props.data.length > 9
                      ? 4
                      : (chartGridPattern[props.data.length][index] as any)
                  }
                >
                  <Component
                    ref={chartRefs[index]}
                    // TODO change props.chartProps[0] to props.chartProps
                    {...props.chartProps[0]}
                    index={index}
                    data={chartData}
                    aggregatedData={aggregatedData}
                    aggregationConfig={props.aggregationConfig}
                    syncHoverState={syncHoverState}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Paper>
        <ChartPopover
          popoverPosition={popoverPosition}
          open={props.data.length > 0}
          containerRef={containerRef}
        >
          <PopoverContent
            chartType={props.chartType}
            tooltipContent={props.tooltipContent}
            focusedState={props.focusedState}
          />
        </ChartPopover>
      </Grid>
      <Grid item>
        <Paper className='ChartPanel__paper'>{props.controls}</Paper>
      </Grid>
    </Grid>
  );
});

export default ChartPanel;
