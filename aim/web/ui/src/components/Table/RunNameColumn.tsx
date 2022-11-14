import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import classNames from 'classnames';

import { Link, Tooltip } from '@material-ui/core';

import StatusLabel from 'components/StatusLabel';

import { PathEnum } from 'config/enums/routesEnum';

function RunNameColumn({
  active,
  runHash,
  run,
  hidden = false,
}: {
  active: boolean;
  runHash: string;
  run: string;
  hidden?: boolean;
}) {
  return (
    <div className={classNames('RunNameColumn', { isHidden: hidden })}>
      <Tooltip title={active ? 'In Progress' : 'Finished'}>
        <div>
          <StatusLabel
            className='Table__status_indicator'
            status={active ? 'success' : 'alert'}
            disabled={hidden}
          />
        </div>
      </Tooltip>
      <Tooltip title={run}>
        <div className='RunNameColumn__runName'>
          <Link
            to={PathEnum.Run_Detail.replace(':runHash', runHash)}
            component={RouteLink}
          >
            {run}
          </Link>
        </div>
      </Tooltip>
    </div>
  );
}

RunNameColumn.displayName = 'RunNameColumn';

export default React.memo(RunNameColumn);
