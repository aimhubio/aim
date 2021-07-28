export interface IDrawParallelHoverAttributesProps {
  index: number;
  dimensions: DimensionsType;
  data: LinesDataType[];
  visAreaRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<{
    xScale?: IGetAxesScale['xScale'];
    yScale?: IGetAxesScale['yScale'];
    x: number;
    y: number;
    updateScales?: (
      xScale: IGetAxesScale['xScale'],
      yScale: IGetAxesScale['yScale'],
    ) => void;
    updateHoverAttributes?: (
      mousePosition: [number, number],
    ) => IActivePointData;
    setActiveLine: (lineKey: string) => void;
  }>;
  closestCircleRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  index: number;
  callback: (
    mousePosition: [number, number],
    activePointData: IActivePointData,
  ) => void;
  highlightedNodeRef: React.MutableRefObject<>;
  highlightMode: HighlightEnum;
}

export interface IGetParallelNearestCirclesProps {
  data: LinesDataType[];
  xScale: IGetAxesScale['xScale'];
  yScale: IGetAxesScale['yScale'];
  mouseX: number;
  mouseY: number;
  keysOfDimensions: string[];
}

export interface IParallelClosestCircle {
  key: string;
  r: number | null;
  x: number;
  y: number;
  values: LineDataType;
  color: string;
}
