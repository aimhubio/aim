import React, { memo } from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import { ActionCard } from 'components/kit';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

import { IRunDetailSettingsTabProps } from './types';

function RunDetailSettingsTab({
  runHash,
  isArchived,
}: IRunDetailSettingsTabProps): React.FunctionComponentElement<React.ReactNode> {
  const history = useHistory();

  function onRunArchive() {
    runDetailAppModel.archiveRun(runHash, !isArchived);
  }

  function onRunDelete() {
    runDetailAppModel.deleteRun(runHash, () => {
      history.push('/runs');
    });
  }

  return (
    <div className='RunDetailSettingsTab'>
      <div className='RunDetailSettingsTab__actionCardsCnt'>
        <ActionCard
          title={isArchived ? 'Unarchive Run' : 'Archive Run'}
          description={
            isArchived
              ? 'Unarchive runs will appear in search both on Dashboard and Explore.'
              : 'Archived runs will not appear in search both on Dashboard and Explore.'
          }
          btnTooltip={isArchived ? 'Unarchive' : 'Archive'}
          btnText={isArchived ? 'Unarchive' : 'Archive'}
          onAction={onRunArchive}
          btnProps={{
            variant: 'outlined',
            className: classNames({
              RunDetailSettingsTab__actionCardsCnt__btn__archive: !isArchived,
              RunDetailSettingsTab__actionCardsCnt__btn__unarchive: isArchived,
            }),
          }}
        />

        <ActionCard
          title='Delete Run'
          description='Once you delete a run, there is no going back. Please be certain.'
          btnTooltip='Delete Run'
          btnText='Delete'
          onAction={onRunDelete}
          btnProps={{
            variant: 'contained',
            className: 'RunDetailSettingsTab__actionCardsCnt__btn__delete',
          }}
        />
      </div>
    </div>
  );
}

export default memo(RunDetailSettingsTab);
