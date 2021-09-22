import React, { memo } from 'react';
import Button from 'components/Button/Button';

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
      <div className='RunDetailSettingsTab__infoBox'>
        <p className='RunDetailSettingsTab__infoBox__title'>
          {isArchived ? 'Unarchive Run' : 'Archive Run'}
        </p>
        <p className='RunDetailSettingsTab__infoBox__message'>
          {isArchived
            ? 'Unarchive runs will appear in search both on Dashboard and Explore.'
            : 'Archived runs will not appear in search both on Dashboard and Explore.'}
        </p>
      </div>
      {isArchived ? (
        <Button
          onClick={onRunArchive}
          color='default'
          variant='contained'
          className='RunDetailSettingsTab__buttonUnarchive'
        >
          Unarchive
        </Button>
      ) : (
        <Button onClick={onRunArchive} color='secondary' variant='contained'>
          Archive this run
        </Button>
      )}
    </div>
  );
}

export default memo(RunDetailSettingsTab);
