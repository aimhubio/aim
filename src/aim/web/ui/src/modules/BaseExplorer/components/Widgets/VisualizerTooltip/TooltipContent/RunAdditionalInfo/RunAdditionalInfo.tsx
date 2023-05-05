import { Link as RouteLink } from 'react-router-dom';
import React from 'react';

import { Divider, Link } from '@material-ui/core';

import { Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';

import { PathEnum } from 'config/enums/routesEnum';

import { IRunAdditionalInfoProps } from '../index';

import './RunAdditionalInfo.scss';

function RunAdditionalInfo(props: IRunAdditionalInfoProps) {
  const { runHash, experimentId } = props;
  return !runHash || !experimentId ? null : (
    <ErrorBoundary>
      <div className='RunAdditionalInfo'>
        <Divider />
        <div className='RunAdditionalInfo__links'>
          <Link
            to={PathEnum.Run_Detail.replace(':runHash', runHash)}
            component={RouteLink}
            className='RunAdditionalInfo__links__link'
            underline='none'
          >
            <Icon name='link' />
            <div>Run Details</div>
          </Link>
          <Link
            to={PathEnum.Experiment.replace(':experimentId', experimentId)}
            component={RouteLink}
            className='RunAdditionalInfo__links__link'
            underline='none'
          >
            <Icon name='link' />
            <div>Experiment Detail</div>
          </Link>
        </div>
        <Divider />
        <div className='RunAdditionalInfo__tags'>
          <AttachedTagsList runHash={runHash} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(RunAdditionalInfo);
