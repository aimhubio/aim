import React, { memo } from 'react';
import classNames from 'classnames';

import Tooltip from '@material-ui/core/Tooltip';

import { Button, Text } from 'components/kit';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

import { IRunDetailSettingsTabProps } from './types';

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
        <Text component='h4' weight={600} size={14} tint={100}>
          {isArchived ? 'Unarchive Run' : 'Archive Run'}
        </Text>
        <Text
          component='p'
          tint={100}
          weight={400}
          className='RunDetailSettingsTab__infoBox__message'
        >
          {isArchived
            ? 'Unarchive runs will appear in search both on Dashboard and Explore.'
            : 'Archived runs will not appear in search both on Dashboard and Explore.'}
        </Text>
      </div>

      <Tooltip
        title={isArchived ? 'Unarchive' : 'Archive this run'}
        placement='top'
      >
        <Button
          onClick={onRunArchive}
          variant='contained'
          className={classNames('RunDetailSettingsTab__btn', {
            RunDetailSettingsTab__btn__archive: isArchived,
          })}
        >
          {isArchived ? 'Unarchive' : 'Archive this run'}
        </Button>
      </Tooltip>
    </div>
  );
}

export default memo(RunDetailSettingsTab);
