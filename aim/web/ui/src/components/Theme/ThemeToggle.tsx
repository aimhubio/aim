import React from 'react';

import { IconButton, Tooltip } from '@material-ui/core';
import Brightness4 from '@material-ui/icons/Brightness4';
import Brightness7 from '@material-ui/icons/Brightness7';

import { ThemeContext } from './Theme';

function ThemeToggle() {
  const { dark, handleTheme } = React.useContext(ThemeContext);

  return (
    <Tooltip
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      placement='right'
    >
      <IconButton
        className='Sidebar__themeToggle'
        aria-label='Dark mode'
        aria-pressed={dark}
        onClick={handleTheme}
      >
        {dark ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
