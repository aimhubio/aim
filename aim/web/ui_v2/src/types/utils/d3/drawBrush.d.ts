import React from 'react';

export interface IDrawBrushProps {
  plotBoxRef: React.MutableRefObject<>;
  plotRef: React.MutableRefObject<>;
  brushRef: React.MutableRefObject<>;
  handleBrushChange: (props: {
    xValues: number[] | null;
    yValues: number[] | null;
  }) => void;
}
