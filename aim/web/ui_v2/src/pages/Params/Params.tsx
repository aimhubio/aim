import React from 'react';
import { Box, Grid } from '@material-ui/core';

import { IParamsProps } from 'types/pages/params/Params';
import { ChartTypeEnum } from 'utils/d3';
import Controls from './components/Controls/Controls';
import ChartPanel from 'components/ChartPanel/ChartPanel';

import './Params.scss';

const Params = ({
  curveInterpolation,
  onCurveInterpolationChange,
  highPlotData,
  onActivePointChange,
  chartPanelRef,
  chartElemRef,
  focusedState,
  isVisibleColorIndicator,
  tooltipContent,
  onColorIndicatorChange,
}: IParamsProps): React.FunctionComponentElement<React.ReactNode> => {
  return (
    <Box
      bgcolor='grey.200'
      component='section'
      height='100vh'
      overflow='hidden'
      className='Params'
    >
      <Grid
        container
        direction='column'
        justifyContent='center'
        className='Params__fullHeight'
        spacing={1}
      >
        <Grid ref={chartElemRef} className='Params__chart__container' item>
          {!!highPlotData?.[0]?.data?.length && (
            <ChartPanel
              ref={chartPanelRef}
              chartType={ChartTypeEnum.HighPlot}
              data={highPlotData}
              focusedState={focusedState}
              onActivePointChange={onActivePointChange}
              tooltipContent={tooltipContent}
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
    </Box>
  );
};

export default React.memo(Params);
