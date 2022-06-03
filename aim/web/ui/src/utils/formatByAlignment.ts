import moment from 'moment';

import { DATE_CHART_TICK } from 'config/dates/dates';

import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';

import shortEnglishHumanizer from 'utils/shortEnglishHumanizer';

import { AlignmentOptionsEnum } from './d3';

function formatValueByAlignment({
  xAxisTickValue,
  type,
  humanizerConfig = {},
}: {
  xAxisTickValue: number | null;
  type?: AlignmentOptionsEnum;
  humanizerConfig?: {};
}) {
  if (xAxisTickValue || xAxisTickValue === 0) {
    switch (type) {
      case AlignmentOptionsEnum.EPOCH:
        return Math.floor(xAxisTickValue);
      case AlignmentOptionsEnum.RELATIVE_TIME:
        return shortEnglishHumanizer(Math.round(xAxisTickValue), {
          ...humanizerConfig,
          maxDecimalPoints: 2,
        });
      case AlignmentOptionsEnum.ABSOLUTE_TIME:
        return moment(xAxisTickValue).format(DATE_CHART_TICK);
      default:
        return xAxisTickValue;
    }
  }
  return xAxisTickValue || '--';
}

function getKeyByAlignment(alignmentConfig?: IAlignmentConfig): string {
  switch (alignmentConfig?.type) {
    case AlignmentOptionsEnum.STEP:
    case AlignmentOptionsEnum.EPOCH:
      return alignmentConfig?.type;
    case AlignmentOptionsEnum.ABSOLUTE_TIME:
    case AlignmentOptionsEnum.RELATIVE_TIME:
      return alignmentConfig?.type.replace('_', ' ');
    case AlignmentOptionsEnum.CUSTOM_METRIC:
      return alignmentConfig?.metric || '';
    default:
      return AlignmentOptionsEnum.STEP;
  }
}

export { formatValueByAlignment, getKeyByAlignment };
