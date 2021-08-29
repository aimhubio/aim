import React, { memo, useEffect, useState } from 'react';
import { Paper, Tab, Tabs } from '@material-ui/core';

import { ITagsProps } from 'types/pages/tags/Tags';
import TabPanel from 'components/TabPanel/TabPanel';
import TagsList from './TagsList';
import './Tags.scss';

function Tags({
  tagsListData,
}: ITagsProps): React.FunctionComponentElement<React.ReactNode> {
  const [value, setValue] = useState(0);
  const [archivedTagsList, setArchivedTagsList] = useState(
    tagsListData?.filter((tag) => tag.archived) || [],
  );
  const [tagsList, setTagsList] = useState(
    tagsListData?.filter((tag) => !tag.archived) || [],
  );

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    setArchivedTagsList(tagsListData?.filter((tag) => tag.archived) || []);
    setTagsList(tagsListData?.filter((tag) => !tag.archived) || []);
  }, [tagsListData]);

  return (
    <section className='Tags'>
      <Paper className='Tags__tabsContainer'>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='simple tabs example'
          indicatorColor='primary'
          className='Tags__tabsContainer__tabs'
        >
          <Tab label='Tags' />
          <Tab label='Hidden Tags' />
        </Tabs>
      </Paper>
      <TabPanel value={value} index={0}>
        <TagsList tagsList={tagsList} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TagsList tagsList={archivedTagsList} isHiddenTagsList />
      </TabPanel>
    </section>
  );
}

export default memo(Tags);
