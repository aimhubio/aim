import clearArea from './clearArea';
import drawArea from './drawArea';
import drawAxes from './drawAxes';
import drawLines from './drawLines';
import processLineChartData from './processLineChartData';
import getAxisScale from './getAxisScale';
import drawBrush from './drawBrush';
import drawHoverAttributes from './drawHoverAttributes';
import drawParallelArea from './drawParrallelArea';
import drawParallelAxes from './drawParallelAxes';
import drawParallelLines from './drawParallelLines';
import drawParallelHoverAttributes from './drawParallelHoverAttributes';
import drawParallelAxesBrush from './drawParallelAxesBrush';
import drawParallelColorIndicator from './drawParallelColorIndicator';
import getCoordinates from './getCoordinates';
import drawPoints from './drawPoints';

const gradientStartColor = '#2980B9';
const gradientEndColor = '#E74C3C';

enum AlignmentKeysEnum {
  STEP = 'step',
  EPOCH = 'epoch',
  RELATIVE_TIME = 'relative_time',
  ABSOLUTE_TIME = 'absolute_time',
}

enum AlignmentOptionsEnum {
  STEP = 0,
  EPOCH = 1,
  RELATIVE_TIME = 2,
  ABSOLUTE_TIME = 3,
  CUSTOM_METRIC = 4,
}

enum CircleEnum {
  Radius = 3,
  ActiveRadius = 5,
}

enum CurveEnum {
  Linear = 'curveLinear',
  Basis = 'curveBasis',
  Bundle = 'curveBundle',
  Cardinal = 'curveCardinal',
  CatmullRom = 'curveCatmullRom',
  MonotoneX = 'curveMonotoneX',
  MonotoneY = 'curveMonotoneY',
  Natural = 'curveNatural',
  Step = 'curveStep',
  StepAfter = 'curveStepAfter',
  StepBefore = 'curveStepBefore',
  BasisClosed = 'curveBasisClosed',
}

enum ScaleEnum {
  Log = 'log',
  Linear = 'linear',
  Point = 'point',
}

enum ChartTypeEnum {
  LineChart = 'LineChart',
  HighPlot = 'HighPlot',
  ScatterPlot = 'ScatterPlot',
  ImageSet = 'ImageSet',
}

enum PointSymbolEnum {
  CIRCLE = 'symbolCircle',
  CROSS = 'symbolCross',
  DIAMOND = 'symbolDiamond',
  SQUARE = 'symbolSquare',
  STAR = 'symbolStar',
  TRIANGLE = 'symbolTriangle',
  WYE = 'symbolWye',
}

export {
  CircleEnum,
  CurveEnum,
  ScaleEnum,
  ChartTypeEnum,
  AlignmentKeysEnum,
  AlignmentOptionsEnum,
  PointSymbolEnum,
  clearArea,
  drawArea,
  drawAxes,
  drawLines,
  getCoordinates,
  drawParallelColorIndicator,
  processLineChartData,
  getAxisScale,
  drawBrush,
  drawHoverAttributes,
  drawParallelArea,
  drawParallelAxes,
  drawParallelLines,
  drawParallelHoverAttributes,
  drawParallelAxesBrush,
  drawPoints,
  gradientStartColor,
  gradientEndColor,
};
