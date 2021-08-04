import React from 'react';
import { Box, Grid, Paper } from '@material-ui/core';
import useStyles from './paramsStyle';
import { IParamsProps } from 'types/pages/params/Params';

import { ChartTypeEnum } from 'utils/d3';
import Controls from './components/Controls/Controls';
import ChartPanel from 'components/ChartPanel/ChartPanel';

//delete before commit
import { mockData, mockData2 } from '../../components/HighPlot/helper';

const Params = ({
  curveInterpolation,
  onCurveInterpolationChange,
  onFocusedStateChange,
  chartPanelRef,
  chartElemRef,
  focusedState,
}: IParamsProps): React.FunctionComponentElement<React.ReactNode> => {
  const classes = useStyles();

  return (
    <Box
      bgcolor='grey.200'
      component='section'
      height='100vh'
      overflow='hidden'
      className={classes.section}
    >
      <Grid
        container
        direction='column'
        justify='center'
        className={classes.fullHeight}
        spacing={1}
      >
        <Grid
          ref={chartElemRef}
          style={{
            flex: '0.5 1 0',
          }}
          item
        >
          <Grid container className={classes.fullHeight} spacing={1}>
            <ChartPanel
              ref={chartPanelRef}
              chartType={ChartTypeEnum.HighPlot}
              data={[mockData, mockData2]}
              focusedState={focusedState}
              onFocusedStateChange={onFocusedStateChange}
              chartProps={[
                {
                  curveInterpolation,
                },
              ]}
              controls={
                <Controls
                  onCurveInterpolationChange={onCurveInterpolationChange}
                  curveInterpolation={curveInterpolation}
                />
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(Params);
