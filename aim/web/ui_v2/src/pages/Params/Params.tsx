import React from 'react';
import { Box, Grid } from '@material-ui/core';

import useStyles from './paramsStyle';
import { IParamsProps } from 'types/pages/params/Params';
import { ChartTypeEnum } from 'utils/d3';
import Controls from './components/Controls/Controls';
import ChartPanel from 'components/ChartPanel/ChartPanel';

const Params = ({
  curveInterpolation,
  onCurveInterpolationChange,
  highPlotData,
  onActivePointChange,
  chartPanelRef,
  chartElemRef,
  focusedState,
  isVisibleColorIndicator,
  onColorIndicatorChange,
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
        justifyContent='center'
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
            {!!highPlotData?.[0]?.data?.length && (
              <ChartPanel
                ref={chartPanelRef}
                chartType={ChartTypeEnum.HighPlot}
                data={highPlotData}
                focusedState={focusedState}
                onActivePointChange={onActivePointChange}
                chartProps={[
                  {
                    curveInterpolation,
                    isVisibleColorIndicator,
                  },
                ]}
                controls={
                  <Controls
                    onCurveInterpolationChange={onCurveInterpolationChange}
                    curveInterpolation={curveInterpolation}
                    isVisibleColorIndicator={isVisibleColorIndicator}
                    onColorIndicatorChange={onColorIndicatorChange}
                  />
                }
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(Params);
