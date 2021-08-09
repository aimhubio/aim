import { IGetAxisScale } from './getAxisScale';
import { ILineDataType, ILinesDataType } from './drawParallelLines';
import { DimensionsType } from './drawParallelAxes';
import { ISyncHoverStateParams } from './drawHoverAttributes';
import React from 'react';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';

export interface IDrawParallelHoverAttributesProps {
  index: number;
  dimensions: DimensionsType;
  visAreaRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<{
    xScale?: IGetAxisScale;
    yScale?: IGetAxisScale;
    x: number;
    y: number;
    updateScales?: (xScale: IGetAxisScale, yScale: IGetAxisScale) => void;
    updateHoverAttributes?: (mousePosition: [number, number]) => void;
    setActiveLine: (lineKey: string) => void;
    yColorIndicatorScale: d3.ScaleSequential;
    mousePosition: number[];
  }>;
  syncHoverState: (params: ISyncHoverStateParams | null) => void;
  closestCircleRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  index: number;
  highlightedNodeRef: React.MutableRefObject<>;
  highlightMode: HighlightEnum;
  isVisibleColorIndicator: boolean;
}

export interface IGetParallelNearestCirclesProps {
  data: ILinesDataType[];
  xScale: IGetAxisScale;
  yScale: IGetAxisScale;
  mouseX: number;
  mouseY: number;
  keysOfDimensions: string[];
  isVisibleColorIndicator?: boolean;
}

export interface IParallelClosestCircle {
  key: string;
  r: number | null;
  x: number;
  y: number;
  values: ILineDataType;
  color: string;
}

export interface IParallelNearestCircle {
  x: number;
  y: number;
  key: string;
  color: string;
}
