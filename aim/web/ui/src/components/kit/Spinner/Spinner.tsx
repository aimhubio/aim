import React from 'react';

import { CircularProgress } from '@material-ui/core';

import { ISpinnerProps } from './Spinner.d';

import './Spinner.scss';

function Spinner({
  style = {},
  className = '',
  ...rest
}: ISpinnerProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div style={style} className={`Spinner ${className}`}>
      <CircularProgress {...rest} />
    </div>
  );
}

Spinner.displayName = 'Spinner';

export default React.memo<ISpinnerProps>(Spinner);
