import React from 'react';
import { useHistory } from 'react-router-dom';

import { IResourceState } from 'modules/core/utils/createResource';

import { IRun } from 'types/services/models/metrics/runModel';

import createActiveRunsEngine from './ActiveRunsStore';

function ActiveRunsTable() {
  const history = useHistory();
  const { current: activeRunsEngine } = React.useRef(createActiveRunsEngine);
  const activeRunsStore: IResourceState<IRun<unknown>> =
    activeRunsEngine.activeRunsState((state) => state);

  React.useEffect(() => {
    activeRunsEngine.fetchActiveRuns();
    return () => {
      activeRunsEngine.activeRunsState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(activeRunsStore.data[0]?.props?.active);
  return (
    <div>
      <h1>ActiveRunsTable</h1>
    </div>
  );
}
export default ActiveRunsTable;
