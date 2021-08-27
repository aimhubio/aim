import React from 'react';

import './AppBar.scss';

function AppBar(props: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='AppBar__container'>
      <div className='AppBar__title'>{props.title}</div>
      {props.children && (
        <div className={`AppBar__content ${props.className || ''}`}>
          {props.children}
        </div>
      )}
    </div>
  );
}

export default AppBar;
