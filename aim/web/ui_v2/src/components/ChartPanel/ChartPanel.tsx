import React from 'react';
import { Grid, Paper } from '@material-ui/core';

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
  const [chartRefs, setChartsRefs] = React.useState<React.RefObject<any>[]>(
    new Array(props.data.length).fill('*').map(() => React.createRef()),
  );

  // TODO: update only x with applied scale
  const syncHoverState = React.useCallback(
    (mousePosition: [number, number], activePointData: IActivePointData) => {
      chartRefs.forEach((chartRef, index) => {
        if (index === activePointData.chartIndex) {
          return;
        }
        chartRef.current.updateHoverAttributes?.(mousePosition);
      });
      if (props.onActivePointChange) {
        props.onActivePointChange(activePointData);
      }
    },
    [chartRefs, props.onActivePointChange],
  );

  React.useImperativeHandle(ref, () => ({
    setActiveLine: (lineKey: string) => {
      chartRefs.forEach((chartRef) => {
        chartRef.current?.setActiveLine?.(lineKey);
      });
    },
    // TODO update lines without reRendering
    updateLines: (data: any) => {
      chartRefs.forEach((chartRef, index) => {
        chartRef.current?.updateLines?.(data[index]);
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
            {props.data.map((data, index) => (
              <Grid
                key={index}
                item
                xs={
                  (props.data.length > 9
                    ? 4
                    : chartGridPattern[props.data.length][index]) as any
                }
              >
                <LineChart
                  ref={chartRefs[index]}
                  {...props.chartProps[0]}
                  index={index}
                  data={data}
                  onMouseOver={syncHoverState}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
      <Grid item>
        <Paper className={classes.paper}>{props.controls}</Paper>
      </Grid>
    </Grid>
  );
});

export default ChartPanel;
