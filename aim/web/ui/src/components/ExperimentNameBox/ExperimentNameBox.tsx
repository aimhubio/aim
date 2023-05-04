import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import classNames from 'classnames';

import { Link, Tooltip } from '@material-ui/core';

import { PathEnum } from 'config/enums/routesEnum';

import { IExperimentNameBoxProps } from '.';

import './ExperimentNameBox.scss';

const ExperimentNameBox = ({
  experimentId,
  experimentName,
  hidden = false,
}: IExperimentNameBoxProps) => {
  return (
    <div className={classNames('ExperimentNameBox', { isHidden: hidden })}>
      <Tooltip title={experimentName}>
        <div className='ExperimentNameBox__experimentName'>
          <Link
            to={
              PathEnum.Experiment.replace(':experimentId', experimentId) +
              '/overview'
            }
            component={RouteLink}
          >
            {experimentName}
          </Link>
        </div>
      </Tooltip>
    </div>
  );
};

export default ExperimentNameBox;
