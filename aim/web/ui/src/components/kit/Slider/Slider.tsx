import React from 'react';

import { Slider as MaterialSlider } from '@material-ui/core';

import { ISliderProps } from './Slider.d';

import './Slider.scss';

function Slider(
  props: ISliderProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='Slider'>
      <MaterialSlider {...props} />
    </div>
  );
}

Slider.displayName = 'Slider';

export default React.memo<ISliderProps>(Slider);
