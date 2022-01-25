import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ISwitcherProps } from './Switcher.d';

import './Switcher.scss';

function Switcher({
  onChange,
  checked,
  color = 'primary',
  leftLabel,
  rightLabel,
  size = 'medium',
  variant = 'contained',
  name = 'switcher',
}: ISwitcherProps) {
  const [checkedValue, setCheckedValue] = React.useState<boolean | undefined>(
    checked,
  );

  function handleClick(e: React.ChangeEvent<any>) {
    setCheckedValue(!checkedValue);
    onChange(e, !checkedValue);
  }

  React.useEffect(() => {
    if (checked !== checkedValue) {
      setCheckedValue(checked);
    }
  }, [checked]);

  return (
    <ErrorBoundary>
      <button
        data-name={name}
        data-testid='switcher'
        className={`Switcher ${`Switcher__${variant}`} ${`Switcher__${color}`} ${`Switcher__${size} ${
          checkedValue ? 'Switcher__checked' : ''
        }`}`}
        onClick={handleClick}
      >
        {leftLabel && <span className='Switcher__leftLabel'>{leftLabel}</span>}
        <i
          className={`Switcher__circle ${
            checkedValue ? 'Switcher__circle__checked' : ''
          }`}
        />
        {rightLabel && (
          <span className='Switcher__rightLabel'>{rightLabel}</span>
        )}
      </button>
    </ErrorBoundary>
  );
}

export default React.memo(Switcher);
