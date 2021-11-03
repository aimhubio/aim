import React from 'react';

import { Text } from 'components/kit';

import { IAppBarProps } from 'types/components/AppBar/AppBar';

import './AppBar.scss';

function AppBar(
  props: IAppBarProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='AppBar__container'>
      <Text
        component='h3'
        weight={600}
        size={14}
        tint={100}
        className='AppBar__title'
      >
        {props.title}
      </Text>
      {props.children && (
        <div className={`AppBar__content ${props.className || ''}`}>
          {props.children}
        </div>
      )}
    </div>
  );
}

export default AppBar;
