import React from 'react';

export interface IDrawAxes {
  axesRef: React.MutableRefObject<>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}
