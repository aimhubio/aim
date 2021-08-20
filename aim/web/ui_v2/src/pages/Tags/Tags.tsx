import React from 'react';
import { Box, Button, Divider, Grid } from '@material-ui/core';

import { NavLink } from 'react-router-dom';
import { ITagProps, ITagsProps } from 'types/pages/tags/Tags';
import './Tags.scss';

function Tags({
  tagsList,
}: ITagsProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Tags'>
      <Grid container justifyContent='center'>
        <Grid xs={6} item>
          <div className='Tags__header'>
            <h3 className='Tags__title'>Tags List</h3>
            <NavLink to={'/tags/create'}>
              <Button
                variant='contained'
                size='small'
                className='Tags__createButton'
              >
                Create Tag
              </Button>
            </NavLink>
          </div>
          <Divider />
          <Grid container spacing={1} className='Tags__tagListBox'>
            {tagsList?.map(
              ({ name, color, id, run_count }: ITagProps, i: number) => (
                <NavLink
                  key={i}
                  to={`/tags/${id}`}
                  className={'Tags__tagListBox__tagBox'}
                >
                  <Box>
                    <Button
                      style={{ background: color || 'transparent' }}
                      variant='contained'
                    >
                      {name}
                    </Button>
                    <span>Runs: {run_count}</span>
                  </Box>
                </NavLink>
              ),
            )}
          </Grid>
        </Grid>
      </Grid>
    </section>
  );
}

export default Tags;
