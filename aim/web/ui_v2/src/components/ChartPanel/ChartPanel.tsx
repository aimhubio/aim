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
    new Array(props.data.length).fill('*').map((_) => React.createRef()),
  );

  function syncHoverState(
    chartIndex: number,
    mousePosition: [number, number],
    activePointData: IActivePointData,
  ): void {
    chartRefs.forEach((chartRef, index) => {
      if (index === chartIndex) {
        return;
      }
      chartRef.current.updateHoverAttributes?.(mousePosition);
    });
    if (props.onActivePointChange) {
      props.onActivePointChange(activePointData);
    }
  }

  React.useImperativeHandle(ref, () => ({
    setActiveLine: (lineKey: string) => {
      chartRefs.forEach((chartRef) => {
        chartRef.current?.setActiveLine?.(lineKey);
      });
    },
  }));

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
                  onMouseOver={(mouse, activePointData) =>
                    syncHoverState(index, mouse, activePointData)
                  }
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
