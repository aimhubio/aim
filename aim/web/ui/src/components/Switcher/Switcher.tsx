import React from 'react';
import { ISwitcherProps } from 'types/components/Switcher/Switcher';
import Icon from 'components/Icon/Icon';

import './Switcher.scss';

function Switcher({
  checked,
  onChange,
  color = 'primary',
  leftLabel,
  rightLabel,
  size = 'medium',
}: ISwitcherProps) {
  const [state, setState] = React.useState<boolean>(checked);

  function handleClick() {
    setState(!state);
    onChange(!state);
  }
  return (
    <div
      className={`Switcher ${`Switcher__${color}`} ${`Switcher__${size}`}`}
      onClick={handleClick}
    >
      <span className='Switcher__leftLabel'>{leftLabel || null}</span>
      <Icon
        className={`Switcher__circle ${
          state ? 'Switcher__circle__checked' : ''
        }`}
        name='check-circle'
      />
      <span className='Switcher__rightLabel'>{rightLabel}</span>
    </div>
  );
}

export default React.memo(Switcher);
