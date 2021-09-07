import React, { memo } from 'react';
import runsAppModel from 'services/models/runs/runsAppModel';
import useModel from 'hooks/model/useModel';
import Runs from './Runs';

const runsRequestRef = runsAppModel.getRunsData();
function RunsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const runsData = useModel(runsAppModel);
  console.log(runsData);
  React.useEffect(() => {
    runsAppModel.initialize();
    runsRequestRef.call();
    return () => {
      runsRequestRef.abort();
    };
  }, []);
  return (
    <Runs
      tableData={runsData?.data}
      isRunsDataLoading={runsData?.requestIsPending}
      onBookmarkCreate={() => null}
      onBookmarkUpdate={() => null}
      onResetConfigData={() => null}
    />
  );
}

export default memo(RunsContainer);
