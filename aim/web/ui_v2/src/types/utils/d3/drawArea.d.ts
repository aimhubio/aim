import React from 'react';

export interface IDrawAreaProps {
  index?: number;
  parentRef: React.MutableRefObject<>;
  visRef: React.MutableRefObject<>;
  svgRef: React.MutableRefObject<>;
  bgRectRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  plotRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  plotBoxRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
}
