import React from 'react';

import { Slider as MaterialSlider } from '@material-ui/core';

import { ISliderProps } from './Slider.d';

import './Slider.scss';

function Slider({
  containerClassName = '',
  style = {},
  prevIconNode = null,
  nextIconNode = null,
  ...rest
}: ISliderProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className={`Slider ${containerClassName}`} style={style}>
      {prevIconNode && prevIconNode}
      <MaterialSlider {...rest} />
      {nextIconNode && nextIconNode}
    </div>
  );
}

Slider.displayName = 'Slider';

export default React.memo<ISliderProps>(Slider);
