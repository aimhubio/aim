import React, { memo, useEffect, useState } from 'react';

import { Paper, Tab, Tabs } from '@material-ui/core';

import TabPanel from 'components/TabPanel/TabPanel';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import * as analytics from 'services/analytics';

import { ITagsProps } from 'types/pages/tags/Tags';

import TagsList from './TagsList';

import './Tags.scss';

function Tags({
  tagsListData,
  isTagsDataLoading,
  tagInfo,
  tagRuns,
  onNotificationDelete,
  notifyData,
  isRunsDataLoading,
  isTagInfoDataLoading,
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
    analytics.trackEvent('[Tags] Tab change');
  };

  useEffect(() => {
    setArchivedTagsList(tagsListData?.filter((tag) => tag.archived) || []);
    setTagsList(tagsListData?.filter((tag) => !tag.archived) || []);
  }, [tagsListData]);

  return (
    <section className='Tags container'>
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
      <TabPanel value={value} index={0} className='Tags__tabPanel'>
        <TagsList
          tagsList={tagsList}
          isTagsDataLoading={isTagsDataLoading}
          tagInfo={tagInfo}
          tagRuns={tagRuns}
          isRunsDataLoading={isRunsDataLoading}
          isTagInfoDataLoading={isTagInfoDataLoading}
        />
      </TabPanel>
      <TabPanel value={value} index={1} className='Tags__tabPanel'>
        <TagsList
          tagsList={archivedTagsList}
          isHiddenTagsList
          isTagsDataLoading={isTagsDataLoading}
          tagInfo={tagInfo}
          tagRuns={tagRuns}
          isRunsDataLoading={isRunsDataLoading}
          isTagInfoDataLoading={isTagInfoDataLoading}
        />
      </TabPanel>
      {notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={onNotificationDelete}
          data={notifyData}
        />
      )}
    </section>
  );
}

export default memo(Tags);
