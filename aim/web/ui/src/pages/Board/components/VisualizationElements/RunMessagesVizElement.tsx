import * as React from 'react';
import _ from 'lodash-es';
import { useModel } from 'hooks';

import RunLogRecords from 'pages/RunDetail/RunLogRecords';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

function RunMessagesVizElement(props: any) {
  const runHash = props.data;

  const runData = useModel(runDetailAppModel);

  React.useEffect(() => {
    runDetailAppModel.initialize();
    const runsRequestRef = runDetailAppModel.getRunInfo(runHash);

    runsRequestRef.call();

    return () => {
      runsRequestRef.abort();
    };
  }, [runHash]);

  return (
    <div
      className='VizComponentContainer'
      style={{ flex: 1, display: 'block', minHeight: 500, padding: 0 }}
    >
      <RunLogRecords
        key={runHash}
        runHash={runHash}
        inProgress={_.isNil(runData?.runInfo?.end_time)}
      />
    </div>
  );
}

export default RunMessagesVizElement;
