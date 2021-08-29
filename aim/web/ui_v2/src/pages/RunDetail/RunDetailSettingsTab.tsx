import React, { memo } from 'react';
import { Button } from '@material-ui/core';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import { IRunDetailSettingsTabProps } from 'types/pages/runs/Runs';

function RunDetailSettingsTab({
  runHash,
  isArchived,
}: IRunDetailSettingsTabProps): React.FunctionComponentElement<React.ReactNode> {
  function onRunArchive() {
    runDetailAppModel.archiveRun(runHash, !isArchived);
  }

  return (
    <div className='RunDetailSettingsTab'>
      {isArchived ? (
        <>
          <p>This run is archived.</p>
          <Button onClick={onRunArchive}>Unarchive</Button>
        </>
      ) : (
        <>
          <Button onClick={onRunArchive}>Archive this run</Button>
          <p>
            Archived runs will not appear in search both on Dashboard and
            Explore.
          </p>
        </>
      )}
    </div>
  );
}

export default memo(RunDetailSettingsTab);
