import React from 'react';
import { Grid, Paper } from '@material-ui/core';

import { IChartPanelProps } from 'types/components/ChartPanel/ChartPanel';
import LineChart from 'components/LineChart/LineChart';

const ChartPanel = React.forwardRef(function ChartPanel(
  props: IChartPanelProps,
  ref,
) {
  const chartRefs = React.useRef();
  return (
    <Grid container spacing={1} className={props.classNames.container}>
      <Grid item xs>
        <Paper className={props.classNames.paper}>
          <Grid container spacing={1} style={{ height: '100%' }}>
            {props.data &&
              props.data.map((data, index) => (
                <Grid item xs key={index}>
                  <LineChart
                    {...props.chartProps[index]}
                    index={index}
                    data={data}
                  />
                </Grid>
              ))}
          </Grid>
        </Paper>
      </Grid>
      <Grid item>
        <Paper className={props.classNames.paper}>{props.controls}</Paper>
      </Grid>
    </Grid>
  );
});

export default ChartPanel;
