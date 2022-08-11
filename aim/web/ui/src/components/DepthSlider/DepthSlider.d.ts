import React from 'react';

export interface IDepthSliderProps {
  index?: number;
  items: any[];
  depth: number;
  onDepthChange: (value: number, index: number) => void;
  style?: React.CSSProperties;
  valueLabelDisplay?: 'on' | 'auto' | 'off';
  label?: React.ReactNode;
  className?: string;
}
