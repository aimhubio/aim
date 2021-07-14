import React from 'react';
import { Grid, Paper } from '@material-ui/core';

import { IChartPanelProps } from 'types/components/ChartPanel/ChartPanel';
import LineChart from 'components/LineChart/LineChart';

import useStyles from './chartPanelStyle';

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
  ): void {
    chartRefs.forEach((chartRef, index) => {
      if (index === chartIndex) {
        return;
      }
      chartRef.current.updateHoverAttributes(mousePosition);
    });
  }

  React.useEffect(() => {
    setTimeout(() => {
      setChartsRefs((r) => [...r]);
    });
  }, []);

  return (
    <Grid container spacing={1} className={classes.container}>
      <Grid item xs>
        <Paper className={classes.paper}>
          <Grid container spacing={1} className={classes.chartGrid}>
            {props.data.map((data, index) => (
              <Grid item xs key={index}>
                <LineChart
                  ref={chartRefs[index]}
                  {...props.chartProps[0]}
                  index={index}
                  data={data}
                  onMouseOver={(mouse) => syncHoverState(index, mouse)}
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
