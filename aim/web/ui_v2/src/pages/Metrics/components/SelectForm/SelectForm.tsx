import React from 'react';
import {
  FormControl,
  Grid,
  InputLabel,
  Select,
  TextField,
} from '@material-ui/core';

function SelectForm(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div>
      <FormControl variant='outlined'>
        <Grid container>
          <InputLabel htmlFor='outlined-age-native-simple'>Age</InputLabel>
          <Select
            native
            label='Select Metric'
            inputProps={{
              name: 'age',
              id: 'outlined-age-native-simple',
            }}
          >
            <option aria-label='None' value='' />
            <option value={10}>actor_loss</option>
            <option value={20}>agg_metric</option>
            <option value={30}>critic_loss</option>
          </Select>
          <TextField variant='outlined' placeholder='Metric expression' />
        </Grid>
      </FormControl>
    </div>
  );
}

export default React.memo(SelectForm);
