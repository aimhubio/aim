import React, { memo, useState } from 'react';
import { Divider, Grid, Paper, Tab, Tabs } from '@material-ui/core';
import { useParams } from 'react-router-dom';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import useModel from 'hooks/model/useModel';
import TabPanel from 'components/TabPanel/TabPanel';
import RunDetailParamsTab from './RunDetailParamsTab';
import RunDetailMetricsAndSystemTab from './RunDetailMetricsAndSystemTab';
import RunDetailSettingsTab from './RunDetailSettingsTab';

import './RunDetail.scss';

function RunDetail(): React.FunctionComponentElement<React.ReactNode> {
  const runsData = useModel(runDetailAppModel);
  const [value, setValue] = useState(0);
  const { runHash } = useParams<{ runHash: string }>();
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    runDetailAppModel.initialize();
    const runsRequestRef = runDetailAppModel.getRunInfo(runHash);
    runsRequestRef.call();
    return () => {
      runsRequestRef.abort();
    };
  }, [runHash]);

  return (
    <section className='RunDetail'>
      <Grid container justifyContent='center'>
        <Grid xs={6} item>
          <h3 className='RunDetail__title'>RunDetail</h3>
          <Divider />
          <Paper>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label='simple tabs example'
              indicatorColor='primary'
              textColor='primary'
            >
              <Tab label='Params' />
              <Tab label='Metrics' />
              <Tab label='System' />
              <Tab label='Settings' />
            </Tabs>
          </Paper>
          <TabPanel value={value} index={0}>
            <RunDetailParamsTab runParams={runsData?.runParams} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <RunDetailMetricsAndSystemTab
              runHash={runHash}
              runTraces={runsData?.runTraces}
              runBatch={runsData?.runMetricsBatch}
            />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <RunDetailMetricsAndSystemTab
              runHash={runHash}
              runTraces={runsData?.runTraces}
              runBatch={runsData?.runSystemBatch}
              isSystem
            />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <RunDetailSettingsTab
              isArchived={runsData?.runInfo?.archived}
              runHash={runHash}
            />
          </TabPanel>
        </Grid>
      </Grid>
    </section>
  );
}

export default memo(RunDetail);
