import React from 'react';
import classNames from 'classnames';

import { Link } from '@material-ui/core';

import { IRunCreatorBoxProps } from '.';

import './RunCreatorBox.scss';

const RunCreatorBox = ({ creatorUsername }: IRunCreatorBoxProps) => {
  return (
    <div
      className={classNames('RunCreatorBox', {
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

export default RunCreatorBox;
