import React from 'react';

import { Slider as MaterialSlider } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

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
    <ErrorBoundary>
      <div className={`Slider ${containerClassName}`} style={style}>
        {prevIconNode && prevIconNode}
        <MaterialSlider {...rest} />
        {nextIconNode && nextIconNode}
      </div>
    </ErrorBoundary>
  );
}

Slider.displayName = 'Slider';

export default React.memo<ISliderProps>(Slider);
