import React from 'react';
import {
  ISwitcherProps,
  SwitcherLabel,
} from 'types/components/Switcher/Switcher';

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

  function isValidLabel(label: SwitcherLabel | unknown) {
    return !(label === null || label === undefined);
  }

  React.useEffect(() => {
    if (checked !== checkedValue) {
      setCheckedValue(checked);
    }
  }, [checked]);

  return (
    <button
      data-name={name}
      className={`Switcher ${`Switcher__${variant}`} ${`Switcher__${color}`} ${`Switcher__${size} ${
        checkedValue ? 'Switcher__checked' : ''
      }`}`}
      onClick={handleClick}
    >
      {isValidLabel(leftLabel) && (
        <span className='Switcher__leftLabel'>{leftLabel}</span>
      )}
      <i
        className={`Switcher__circle ${
          checkedValue ? 'Switcher__circle__checked' : ''
        }`}
      />
      {isValidLabel(rightLabel) && (
        <span className='Switcher__rightLabel'>{rightLabel}</span>
      )}
    </button>
  );
}

export default React.memo(Switcher);
