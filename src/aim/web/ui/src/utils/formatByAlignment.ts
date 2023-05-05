import moment from 'moment';

import { DATE_CHART_TICK } from 'config/dates/dates';

import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';

import shortEnglishHumanizer from 'utils/shortEnglishHumanizer';

import { AlignmentOptionsEnum } from './d3';
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
