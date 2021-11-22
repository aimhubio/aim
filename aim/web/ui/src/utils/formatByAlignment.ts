import moment from 'moment';

import shortEnglishHumanizer from 'utils/shortEnglishHumanizer';

import { IAlignmentConfig } from '../types/services/models/metrics/metricsAppModel';

import { AlignmentKeysEnum, AlignmentOptionsEnum } from './d3';

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
        return moment(xAxisTickValue).format('HH:mm:ss D MMM, YY');
      default:
        return xAxisTickValue;
    }
  }
  return xAxisTickValue ?? '--';
}

function getKeyByAlignment(alignmentConfig?: IAlignmentConfig): string {
  switch (alignmentConfig?.type) {
    case AlignmentOptionsEnum.STEP:
      return AlignmentKeysEnum.STEP;
    case AlignmentOptionsEnum.EPOCH:
      return AlignmentKeysEnum.EPOCH;
    case AlignmentOptionsEnum.ABSOLUTE_TIME:
      return AlignmentKeysEnum.ABSOLUTE_TIME.replace('_', ' ');
    case AlignmentOptionsEnum.RELATIVE_TIME:
      return AlignmentKeysEnum.RELATIVE_TIME.replace('_', ' ');
    case AlignmentOptionsEnum.CUSTOM_METRIC:
      return alignmentConfig?.metric || '';
    default:
      return '';
  }
}

export { formatValueByAlignment, getKeyByAlignment };
