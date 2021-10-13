import React from 'react';

export interface ITextProps
  extends Partial<
    React.HTMLAttributes<
      HTMLSpanElement | HTMLHeadingElement | HTMLParagraphElement | HTMLElement
    >
  > {
  component?: componentType;
  weight?: componentWeightType;
  size?: componentSizeType;
  color?: componentColorType;
  className?: string;
  children?: React.ReactNode;
  tint?: componentTintType;
}

type componentType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'span'
  | 'p'
  | 'strong'
  | 'small';
type componentColorType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';
type componentSizeType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type componentWeightType = 300 | 400 | 500 | 600 | 700;
type componentTintType = 5 | 10 | 20 | 30 | 40 | 50 | 60 | 80 | 90 | 100;
