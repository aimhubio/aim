import React from 'react';

import { Slider as MaterialSlider } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ISliderProps } from './Slider.d';

import './Slider.scss';

function Slider({
  containerClassName,
  ...rest
}: ISliderProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div className={`Slider ${containerClassName || ''}`}>
        <MaterialSlider {...rest} />
      </div>
    </ErrorBoundary>
  );
}

Slider.displayName = 'Slider';

export default React.memo<ISliderProps>(Slider);
