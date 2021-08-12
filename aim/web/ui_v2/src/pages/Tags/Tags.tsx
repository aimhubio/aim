import React from 'react';
import { Box, Button, Divider, Grid } from '@material-ui/core';

import './tagsStyle.scss';
import { NavLink } from 'react-router-dom';

function Tags({
  tagsList,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Tags'>
      <Grid container justify='center'>
        <Grid xs={6} item>
          <div className='Tags__header'>
            <h3 className='Tags__title'>Tags List</h3>
            <NavLink to={'/tags/create'}>
              <Button
                variant='contained'
                size='small'
                className='Tags__create-button'
              >
                Create Tag
              </Button>
            </NavLink>
          </div>
          <Divider />
          <Grid container spacing={1} className='Tags__tag-list-box'>
            {tagsList?.map((tag: any, i: number) => (
              <NavLink key={i} to={'/tags/info'}>
                <Box>
                  <Button variant='contained'>{tag.name}</Button>
                </Box>
              </NavLink>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </section>
  );
}

export default Tags;
