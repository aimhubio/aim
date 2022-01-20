import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { Button } from '../index';

import IToggleButtonProps from './ToggleButton.d';

import './ToggleButton.scss';

function ToggleButton({
  leftLabel,
  rightLabel,
  title,
  leftValue,
  rightValue,
  onChange,
  value,
  id,
  className,
}: IToggleButtonProps): React.FunctionComponentElement<React.ReactNode> {
  const [state, setState] = React.useState<number | string>(value);

  function handleToggle(e: any): void {
    const { id, value } = e.currentTarget;
    setState(value);
    onChange(value, id);
  }

  return (
    <ErrorBoundary>
      <div className={`ToggleButton ${className || ''}`}>
        <span className='ToggleButton__title'>{title}</span>
        <div className='ToggleButton__container'>
          <Button
            id={id}
            value={leftValue}
            variant={state === leftValue ? 'contained' : 'text'}
            size='small'
            color={state === leftValue ? 'primary' : 'inherit'}
            onClick={handleToggle}
          >
            {leftLabel}
          </Button>
          <Button
            id={id}
            value={rightValue}
            variant={state === rightValue ? 'contained' : 'text'}
            size='small'
            color={state === rightValue ? 'primary' : 'inherit'}
            onClick={handleToggle}
          >
            {rightLabel}
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default ToggleButton;
