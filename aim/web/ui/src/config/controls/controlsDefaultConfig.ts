import { DensityOptions } from 'config/enums/densityEnum';
import {
  ImageRenderingEnum,
  MediaItemAlignmentEnum,
} from 'config/enums/imageEnums';

import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import {
  AlignmentOptionsEnum,
  CurveEnum,
  ScaleEnum,
  TrendlineTypeEnum,
  HighlightEnum,
  ZoomEnum,
} from 'utils/d3';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';

export const CONTROLS_DEFAULT_CONFIG = {
  metrics: {
    highlightMode: HighlightEnum.Metric,
    ignoreOutliers: true,
    axesScaleType: {
      xAxis: ScaleEnum.Linear,
      yAxis: ScaleEnum.Linear,
    },
    axesScaleRange: {
      yAxis: { min: undefined, max: undefined },
      xAxis: { min: undefined, max: undefined },
    },
    alignmentConfig: {
      type: AlignmentOptionsEnum.STEP,
      metric: '',
    },
    densityType: DensityOptions.Maximum,
    smoothingFactor: 0,
    curveInterpolation: CurveEnum.Linear,
    smoothingAlgorithm: SmoothingAlgorithmEnum.EMA,
    aggregationConfig: {
      methods: {
        area: AggregationAreaMethods.MIN_MAX,
        line: AggregationLineMethods.MEAN,
      },
      isApplied: false,
      isEnabled: false,
    },
    tooltip: {
      display: true,
      selectedFields: [],
    },
    zoom: {
      active: false,
      mode: ZoomEnum.MULTIPLE,
    },
  },
  params: {
    curveInterpolation: CurveEnum.MonotoneX,
    isVisibleColorIndicator: false,
    tooltip: {
      display: true,
      selectedFields: [],
    },
    sortFields: [],
  },
  images: {
    alignmentType: MediaItemAlignmentEnum.Height,
    mediaItemSize: 25,
    imageRendering: ImageRenderingEnum.Smooth,
    stacking: false,
    tooltip: {
      display: true,
      selectedFields: [],
    },
    sortFields: [],
  },
  scatters: {
    trendlineOptions: {
      type: TrendlineTypeEnum.SLR,
      bandwidth: 0.66,
      isApplied: false,
    },
    tooltip: {
      display: true,
      selectedFields: [],
    },
    sortFields: [],
  },
};
