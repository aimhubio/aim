import { ITooltipContent } from 'types/services/models/metrics/metricsAppModel';

import { getValue } from './helper';

function filterTooltipContent(
  tooltipContent: ITooltipContent,
  selectedFields: string[] = [],
): ITooltipContent {
  const filteredFields: ITooltipContent['selectedFields'] =
    selectedFields.reduce((acc: any, param: string) => {
      acc[param] = getValue(tooltipContent, param);
      return acc;
    }, {});
  return { ...tooltipContent, selectedFields: filteredFields };
}

export default filterTooltipContent;
