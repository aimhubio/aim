import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { ZoomEnum } from 'components/ZoomInPopover/ZoomInPopover';

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
      selectedParams: [],
    },
    zoom: {
      active: false,
      mode: ZoomEnum.SINGLE,
    },
  },
  params: {
    curveInterpolation: CurveEnum.MonotoneX,
    isVisibleColorIndicator: false,
    tooltip: {
      display: true,
      selectedParams: [],
    },
  },
  images: {
    alignmentType: MediaItemAlignmentEnum.Height,
    mediaItemSize: 25,
    imageRendering: ImageRenderingEnum.Pixelated,
    stacking: false,
    tooltip: {
      display: true,
      selectedParams: [],
    },
  },
  scatters: {
    trendlineOptions: {
      type: TrendlineTypeEnum.SLR,
      bandwidth: 0.66,
      isApplied: false,
    },
    tooltip: {
      display: true,
      selectedParams: [],
    },
  },
};
