import React, { memo, useEffect, useState } from 'react';
import { Divider, Grid, Paper, Tab, Tabs } from '@material-ui/core';
import { useParams } from 'react-router-dom';

import useModel from 'hooks/model/useModel';
import TabPanel from 'components/TabPanel/TabPanel';
import TagSettings from './TagSettings';
import tagsDetailAppModel from 'services/models/tags/tagDetailAppModel';
import TagRuns from './TagRuns';
import './Tags.scss';

function TagDetail(): React.FunctionComponentElement<React.ReactNode> {
  const tagsData = useModel(tagsDetailAppModel);
  const { id }: { id: string } = useParams();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    tagsDetailAppModel.initialize();
    const tagRequestRef = tagsDetailAppModel.getTagById(id);
    tagRequestRef.call();
    return () => {
      tagRequestRef.abort();
    };
  }, [id]);

  return (
    <section className='Tags'>
      <Grid container justifyContent='center'>
        <Grid xs={6} item>
          <h3 className='Tags__title'>{`Tag/${tagsData?.tagInfo?.name}`}</h3>
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
            <TagRuns tagHash={id} tagRuns={tagsData?.tagRuns} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <TagSettings tagHash={id} tagInfo={tagsData?.tagInfo} />
          </TabPanel>
        </Grid>
      </Grid>
    </section>
  );
}

export default memo(TagDetail);
