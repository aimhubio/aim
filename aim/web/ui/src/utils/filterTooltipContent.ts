import moment from 'moment';
import _ from 'lodash-es';

import { DATE_WITH_SECONDS } from 'config/dates/dates';

import { ITooltipContent } from 'types/services/models/metrics/metricsAppModel';

import { getValue } from './helper';

function filterTooltipContent(
  tooltipContent: ITooltipContent,
  selectedFields: string[] = [],
): ITooltipContent {
  const filteredFields: ITooltipContent['selectedFields'] =
    selectedFields.reduce((acc: { [key: string]: string }, param: string) => {
      const value: string | number = getValue(tooltipContent, param);
      if (
        param === 'run.props.creation_time' ||
        param === 'run.props.end_time'
      ) {
        acc[param] = !_.isNil(value)
          ? moment((value as number) * 1000).format(DATE_WITH_SECONDS)
          : value;
      } else {
        acc[param] = value as string;
      }
      return acc;
    }, {});
  return { ...tooltipContent, selectedFields: filteredFields };
}

export default filterTooltipContent;
