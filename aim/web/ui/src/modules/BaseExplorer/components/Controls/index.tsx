import React from 'react';

import { IBaseComponentProps } from '../../types';

import BoxConfig from './BoxConfig';

import './styles.scss';

function Controls(props: IBaseComponentProps) {
  return (
    <div className='Controls__container ScrollBar__hidden'>
      <div>
        <BoxConfig engine={props.engine} />
      </div>
    </div>
  );
}

export default React.memo<IBaseComponentProps>(Controls);
