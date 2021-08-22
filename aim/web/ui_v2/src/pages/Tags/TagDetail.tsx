import React, { memo, useEffect, useState } from 'react';
import { Divider, Grid, Paper, Tab, Tabs } from '@material-ui/core';
import { useParams } from 'react-router-dom';

import tagsService from 'services/api/tags/tagsService';
import TabPanel from 'components/TabPanel/TabPanel';
import TagForm from 'components/TagForm/TagForm';
import './Tags.scss';

function TagDetail(): React.FunctionComponentElement<React.ReactNode> {
  const [state, setState] = useState<{ name: string; color: string | null }>({
    name: '',
    color: '',
  });
  const { id }: { id: string } = useParams();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    tagsService
      .getTagById(id)
      .call()
      .then((res: any): void => setState({ name: res.name, color: res.color }));
  }, [id]);

  return (
    <section className='Tags'>
      <Grid container justifyContent='center'>
        <Grid xs={6} item>
          <h3 className='Tags__title'>{`Tag/${state?.name}`}</h3>
          <Divider />
          <Paper>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label='simple tabs example'
              indicatorColor='primary'
              textColor='primary'
            >
              <Tab label='Related Runs' />
              <Tab label='Settings' />
            </Tabs>
          </Paper>
          <TabPanel value={value} index={0}>
            Empty
          </TabPanel>
          <TabPanel value={value} index={1}>
            <TagForm tagData={state} editMode tagId={id} />
          </TabPanel>
        </Grid>
      </Grid>
    </section>
  );
}

export default memo(TagDetail);
