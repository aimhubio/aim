import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  PopoverPosition,
} from '@material-ui/core';
import { debounce } from 'lodash-es';

import { IChartPanelProps } from 'types/components/ChartPanel/ChartPanel';
import chartGridPattern from 'config/chart-grid-pattern/chartGridPattern';
import { chartTypesConfig } from './config';
import { ISyncHoverStateParams } from 'types/utils/d3/drawHoverAttributes';
import './chartPanelStyle.scss';
import ChartPopover from './ChartPopover';

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

  const syncHoverState = React.useCallback(
    (params: ISyncHoverStateParams): void => {
      const { activePoint, focusedStateActive } = params;
      // on MouseHover
      if (activePoint !== null) {
        chartRefs.forEach((chartRef, index) => {
          if (index === activePoint.chartIndex) {
            return;
          }
          chartRef.current?.updateHoverAttributes?.(activePoint.xValue);
        });

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
              (props.focusedState.topPos || 0) -
              (containerRef.current?.scrollTop || 0),
            left:
              (props.focusedState.leftPos || 0) -
              (containerRef.current?.scrollLeft || 0),
          }
        : null;
    });
  }, [props.focusedState]);

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
  }, [props.focusedState]);

  // TODO: remove setTimeout
  React.useEffect(() => {
    setTimeout(() => {
      setChartsRefs((refs) => [...refs]);
    });
  }, []);

  React.useEffect(() => {
    const debouncedScroll = debounce(onScroll, 100);
    containerRef.current?.addEventListener('scroll', debouncedScroll);
    return () => {
      containerRef.current?.removeEventListener('scroll', debouncedScroll);
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
            className='ChartPanel__grid'
          >
            {props.data.map((chartData: any, index: number) => {
              const Component = chartTypesConfig[props.chartType];
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
                    syncHoverState={syncHoverState}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Grid>
      <Grid item>
        <Paper className='ChartPanel__paper'>{props.controls}</Paper>
      </Grid>
      <ChartPopover
        popoverPosition={popoverPosition}
        open={props.data.length > 0}
        containerRef={containerRef}
      >
        <Box p={1}>
          <Typography>Value: {props.focusedState.yValue || 0}</Typography>
          <Typography>Step: {props.focusedState.xValue || 0}</Typography>
        </Box>
      </ChartPopover>
    </Grid>
  );
});

export default ChartPanel;
