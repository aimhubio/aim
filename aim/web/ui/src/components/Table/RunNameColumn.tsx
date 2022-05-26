import React from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { Link, Tooltip } from '@material-ui/core';

import StatusLabel from 'components/StatusLabel';

import { PathEnum } from 'config/enums/routesEnum';

function RunNameColumn({
  active,
  runHash,
  run,
}: {
  active: boolean;
  runHash: string;
  run: string;
}) {
  return (
    <div className='fac'>
      <Tooltip title={active ? 'In Progress' : 'Finished'}>
        <div>
          <StatusLabel
            className='Table__status_indicator'
            status={active ? 'success' : 'alert'}
          />
        </div>
      </Tooltip>

      <Link
        to={PathEnum.Run_Detail.replace(':runHash', runHash)}
        component={RouteLink}
      >
        {run}
      </Link>
    </div>
  );
}

RunNameColumn.displayName = 'RunNameColumn';

export default React.memo(RunNameColumn);
