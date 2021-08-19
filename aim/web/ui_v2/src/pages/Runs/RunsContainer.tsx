import React, { memo } from 'react';
import runsAppModel from 'services/models/runs/runsAppModel';
import useModel from 'hooks/model/useModel';
import Runs from './Runs';

const runsRequestRef = runsAppModel.getRunsData();
function RunsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const runsData = useModel(runsAppModel);

  React.useEffect(() => {
    runsAppModel.initialize();
    runsRequestRef.call();
    return () => {
      runsRequestRef.abort();
    };
  }, []);
  return <Runs runsData={runsData?.data} />;
}

export default memo(RunsContainer);
