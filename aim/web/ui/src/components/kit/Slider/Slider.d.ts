import React from 'react';

import { SliderProps } from '@material-ui/core';

export interface ISliderProps extends SliderProps {
  containerClassName?: string;
  style?: React.CSSProperties;
  onChange?: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
  prevIconNode?: React.ReactNode;
  nextIconNode?: React.ReactNode;
}
