import React from 'react';

import { SliderProps } from '@material-ui/core';

export interface ISliderProps extends SliderProps {
  containerClassName?: string;
  onChange?: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
}
