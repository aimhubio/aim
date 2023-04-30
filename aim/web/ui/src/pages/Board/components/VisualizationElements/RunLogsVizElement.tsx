import * as React from 'react';
import _ from 'lodash-es';
import { useModel } from 'hooks';

import RunLogsTab from 'pages/RunDetail/RunLogsTab';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

function RunLogsVizElement(props: any) {
  const runHash = props.data;

  const runData = useModel(runDetailAppModel);

  return (
    <div
      className='VizComponentContainer'
      style={{ flex: 1, display: 'block' }}
    >
      <RunLogsTab
        key={runHash}
        runHash={runHash}
        runLogs={runData?.runLogs}
        inProgress={_.isNil(runData?.runInfo?.end_time)}
        updatedLogsCount={runData?.updatedLogsCount}
        isRunLogsLoading={runData?.isRunLogsLoading}
      />
    </div>
  );
}

export default RunLogsVizElement;
