import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Grid } from '@material-ui/core';
import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';
import { IRunsProps } from 'types/pages/runs/Runs';

function Runs({
  runsData,
}: IRunsProps): React.FunctionComponentElement<React.ReactNode> {
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
        <Grid item>
          {runsData?.map((run: IRun<IMetricTrace | IParamTrace>) => (
            <NavLink key={run.hash} to={`runs/${run.hash}`}>
              <p>{run.hash}</p>
            </NavLink>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Runs;
