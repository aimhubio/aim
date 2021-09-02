import React from 'react';
import IToggleButtonProps from 'types/components/ToggleButton/ToggleButton';

import './ToggleButton.scss';

function ToggleButton({
  leftLabel,
  rightLabel,
  ...rest
}: IToggleButtonProps): React.FunctionComponentElement<React.ReactNode> {
  const [index, setIndex] = React.useState<number>(0);

  function handleToggle(e: React.SyntheticEvent): void {
    const { id } = e.currentTarget;
    setIndex(+id);
  }

  return (
    <div className='ToggleButton'>
      <div
        id='0'
        onClick={handleToggle}
        className={`ToggleButton__label ${index === 0 ? 'active' : ''}`}
      >
        <span>{leftLabel}</span>
      </div>
      {/* <Button></Button> */}
      <div
        id='1'
        onClick={handleToggle}
        className={`ToggleButton__label ${index === 1 ? 'active' : ''}`}
      >
        <span>{rightLabel}</span>
      </div>
      <span className='ToggleButton__Switcher'></span>
    </div>
  );
}

export default ToggleButton;
