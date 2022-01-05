import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { DensityOptions } from 'config/enums/densityEnum';
import {
  ImageRenderingEnum,
  MediaItemAlignmentEnum,
} from 'config/enums/imageEnums';

import { AlignmentOptionsEnum, CurveEnum, ScaleEnum } from 'utils/d3';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';

export const CONTROLS_DEFAULT_CONFIG = {
  metrics: {
    highlightMode: HighlightEnum.Off,
    axesScaleType: {
      xAxis: ScaleEnum.Linear,
      yAxis: ScaleEnum.Linear,
    },
    alignmentConfig: {
      type: AlignmentOptionsEnum.STEP,
      metric: '',
    },
    densityType: DensityOptions.Minimum,
    smoothingFactor: 0,
    curveInterpolation: CurveEnum.Linear,
    smoothingAlgorithm: SmoothingAlgorithmEnum.EMA,
    tooltip: {
      display: true,
      selectedParams: [],
    },
  },
  params: {
    tooltip: {
      display: true,
      selectedParams: [],
    },
  },
  images: {
    alignmentType: MediaItemAlignmentEnum.Height,
    mediaItemSize: 25,
    imageRendering: ImageRenderingEnum.Pixelated,
    tooltip: {
      display: true,
      selectedParams: [],
    },
  },
  scatters: {
    tooltip: {
      display: true,
      selectedParams: [],
    },
  },
};
