import moment from 'moment';

import { DATE_CHART_TICK } from 'config/dates/dates';

import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';

import shortEnglishHumanizer from 'utils/shortEnglishHumanizer';

import { AlignmentKeysEnum, AlignmentOptionsEnum } from './d3';
import { formatValue } from './formatValue';

function formatValueByAlignment({
  xAxisTickValue,
  type,
  humanizerConfig = {},
}: {
  xAxisTickValue: number | null;
  type?: AlignmentOptionsEnum;
  humanizerConfig?: {};
}) {
  let formatted: string | number | null = xAxisTickValue;

  if (xAxisTickValue || xAxisTickValue === 0) {
    switch (type) {
      case AlignmentOptionsEnum.EPOCH:
        formatted = Math.floor(xAxisTickValue);
        break;
      case AlignmentOptionsEnum.RELATIVE_TIME:
        formatted = shortEnglishHumanizer(Math.round(xAxisTickValue), {
          ...humanizerConfig,
          maxDecimalPoints: 2,
        });
        break;
      case AlignmentOptionsEnum.ABSOLUTE_TIME:
        formatted = moment(xAxisTickValue).format(DATE_CHART_TICK);
        break;
      default:
        formatted = xAxisTickValue;
    }
  }
  return formatValue(formatted);
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
