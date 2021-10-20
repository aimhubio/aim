import { ITooltipContent } from 'types/services/models/metrics/metricsAppModel';

function filterTooltipContent(
  tooltipContent: ITooltipContent,
  selectedParams: string[] = [],
): ITooltipContent {
  const params: ITooltipContent['params'] = tooltipContent?.params || {};
  const filteredParams: ITooltipContent['params'] = {};

  for (let paramKey of Object.keys(params)) {
    if (selectedParams.indexOf(`run.params.${paramKey}`) !== -1) {
      filteredParams[paramKey] = params[paramKey];
    }
  }

  return { ...tooltipContent, params: filteredParams };
}

export default filterTooltipContent;
