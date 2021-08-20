import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Grid } from '@material-ui/core';
import { IRun } from 'types/services/models/metrics/runModel';
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
          {runsData?.map((run: IRun) => (
            <NavLink key={run.runHash} to={`runs/${run.runHash}`}>
              <p>{run.runHash}</p>
            </NavLink>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Runs;
