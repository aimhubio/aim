import { DensityOptions } from 'config/enums/densityEnum';
import {
  ImageRenderingEnum,
  MediaItemAlignmentEnum,
} from 'config/enums/imageEnums';

import { TooltipAppearanceEnum } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

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
  LegendsModeEnum,
} from 'utils/d3';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';

export const CONTROLS_DEFAULT_CONFIG = {
  metrics: {
    highlightMode: HighlightEnum.Run,
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
    smoothing: {
      algorithm: SmoothingAlgorithmEnum.EMA,
      factor: 0.6,
      curveInterpolation: CurveEnum.Linear,
      isApplied: false,
    },
    aggregationConfig: {
      methods: {
        area: AggregationAreaMethods.MIN_MAX,
        line: AggregationLineMethods.MEAN,
      },
      isApplied: false,
      isEnabled: false,
    },
    tooltip: {
      appearance: TooltipAppearanceEnum.Auto,
      display: true,
      selectedFields: [],
    },
    zoom: {
      active: false,
      mode: ZoomEnum.MULTIPLE,
      history: [],
    },
    legends: {
      display: true,
      mode: LegendsModeEnum.PINNED,
    },
  },
  params: {
    curveInterpolation: CurveEnum.MonotoneX,
    isVisibleColorIndicator: false,
    tooltip: {
      appearance: TooltipAppearanceEnum.Auto,
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
      appearance: TooltipAppearanceEnum.Auto,
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
      appearance: TooltipAppearanceEnum.Auto,
      display: true,
      selectedFields: [],
    },
    sortFields: [],
  },
};
