import React from 'react';

import { IControlsProps } from '../../types';

import './styles.scss';

function Controls(props: IControlsProps) {
  const controls = Object.keys(props.engine.controls).map((key: string) => {
    const Control = props.engine.controls[key].component;
    return <Control key={key} {...props} />;
  });

  return (
    <div className='Controls__container ScrollBar__hidden'>
      <div>{controls}</div>
    </div>
  );
}

export default React.memo<IControlsProps>(Controls);
