import React from 'react';
import classNames from 'classnames';

import { Link } from '@material-ui/core';

import { IExperimentNameBoxProps } from '.';

import './RunCreatorBox.scss';

const ExperimentNameBox = ({ creatorUsername }: IExperimentNameBoxProps) => {
  return (
    <div
      className={classNames('ExperimentNameBox', {
        isHidden: creatorUsername === '',
      })}
    >
      <div className='CreatorBox__creatorUsername'>
        <Link href={`${window.location.origin}/${creatorUsername}`}>
          {creatorUsername}
        </Link>
      </div>
    </div>
  );
};

export default ExperimentNameBox;
