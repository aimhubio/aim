import React from 'react';
import {
  Grid,
  Paper,
  Popover,
  Typography,
  Box,
  PopoverPosition,
} from '@material-ui/core';
import { isEqual } from 'lodash-es';

import { IChartPanelProps } from 'types/components/ChartPanel/ChartPanel';
import { IActivePointData } from 'types/utils/d3/drawHoverAttributes';
import LineChart from 'components/LineChart/LineChart';

import useStyles from './chartPanelStyle';
import chartGridPattern from 'config/chart-grid-pattern/chartGridPattern';

const ChartPanel = React.forwardRef(function ChartPanel(
  props: IChartPanelProps,
  ref,
) {
  const classes = useStyles();
  const { data, onActivePointChange, chartProps, controls } = props;

  const [chartRefs, setChartsRefs] = React.useState<React.RefObject<any>[]>(
    new Array(data.length).fill('*').map(() => React.createRef()),
  );
  const [popover, setPopover] = React.useState<PopoverPosition | null>(null);

  // TODO this refs must stay on model
  const activePointDataRef = React.useRef<IActivePointData>();
  const hasFocusedCircleRef = React.useRef<boolean>(false);

  const onPopoverChange = React.useCallback(
    (popover: PopoverPosition | null): void => {
      setPopover((prevState) => {
        if (isEqual(prevState, popover)) {
          return prevState;
        }
        return popover;
      });
    },
    [],
  );

  const syncChartMouseLeave = React.useCallback(
    (chartIndex: number): void => {
      chartRefs.forEach((chartRef, index) => {
        if (index === chartIndex) {
          onPopoverChange(null);
          return;
        }
        chartRef.current.clearLinesAndAttributes?.();
      });
    },
    [chartRefs, onPopoverChange],
  );

  // TODO: update only x with applied scale
  const syncHoverState = React.useCallback(
    (
      chartIndex: number,
      mousePosition: [number, number],
      activePointData: IActivePointData,
    ): void => {
      chartRefs.forEach((chartRef, index) => {
        if (index === chartIndex) {
          activePointDataRef.current = activePointData;
          onPopoverChange({
            top: activePointData.pageY,
            left: activePointData.pageX,
          });
          return;
        }
        chartRef.current.updateHoverAttributes?.(mousePosition);
      });
      if (onActivePointChange) {
        onActivePointChange(activePointData);
      }
    },
    [chartRefs, onActivePointChange, onPopoverChange],
  );

  React.useImperativeHandle(ref, () => ({
    setActiveLine: (lineKey: string, chartIndex: number) => {
      chartRefs.forEach((chartRef) => {
        chartRef.current?.setActiveLine?.(lineKey, chartIndex);
      });
    },
  }));

  // TODO: remove setTimeout
  React.useEffect(() => {
    setTimeout(() => {
      setChartsRefs((refs) => [...refs]);
    });
  }, []);

  return (
    <Grid container spacing={1} className={classes.chartContainer}>
      <Grid item xs className={classes.chartPanel}>
        <Paper className={classes.paper}>
          <Grid container spacing={1} className={classes.chartGrid}>
            {data.map((lineChartData, index) => (
              <Grid
                key={index}
                item
                xs={
                  data.length > 9
                    ? 4
                    : (chartGridPattern[data.length][index] as any)
                }
              >
                <LineChart
                  ref={chartRefs[index]}
                  {...chartProps[0]}
                  index={index}
                  data={lineChartData}
                  onMouseOver={syncHoverState}
                  onMouseLeave={syncChartMouseLeave}
                  hasFocusedCircleRef={hasFocusedCircleRef}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
      <Grid item>
        <Paper className={classes.paper}>{controls}</Paper>
      </Grid>
      {!!popover && (
        <Popover
          id={'lineChart-popover'}
          open={!!(data.length > 0 && popover)}
          anchorReference='anchorPosition'
          anchorPosition={popover}
          className={classes.popover}
          classes={{
            paper: classes.popoverContent,
          }}
        >
          <Box p={1}>
            <Typography>Value: {activePointDataRef.current?.yValue}</Typography>
            <Typography>Step: {activePointDataRef.current?.xValue}</Typography>
          </Box>
        </Popover>
      )}
    </Grid>
  );
});

export default ChartPanel;
