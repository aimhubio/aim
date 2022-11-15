import React from 'react';
import classNames from 'classnames';

import { ResizePanelDotsProps } from '.';

import './ResizePanelDots.scss';

function ResizePanelDots({ direction = 'horizontal' }: ResizePanelDotsProps) {
  return (
    <div className={classNames('ResizePanelDots', { [direction]: true })} />
  );
}

export default React.memo(ResizePanelDots);
