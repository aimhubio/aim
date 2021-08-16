import React, { memo } from 'react';
import { Divider, Grid } from '@material-ui/core';
import TagForm from 'components/TagForm/TagForm';

import './Tags.scss';

function CreateTag(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Tags'>
      <Grid container justifyContent='center'>
        <Grid xs={6} item>
          <h3 className='Tags__title'>Create Tag</h3>
          <Divider />
          <TagForm />
        </Grid>
      </Grid>
    </section>
  );
}

export default memo(CreateTag);
