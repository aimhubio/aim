import moment from 'moment';
import _ from 'lodash-es';

import { DATE_WITH_SECONDS } from 'config/dates/dates';
import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import {
  IGroupingSelectOption,
  IMetricsCollection,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';
import { IParam } from 'types/services/models/params/paramsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { getValue } from './helper';
import getGroupConfig from './app/getGroupConfig';

function getTooltipContent({
  groupingNames = [],
  groupingSelectOptions = [],
  data = [],
  configData,
  activePointKey = null,
  selectedFields = [],
}: {
  groupingNames: GroupNameEnum[];
  groupingSelectOptions: IGroupingSelectOption[];
  data: IMetricsCollection<IParam | IMetric | any>[];
  configData: IAppModelConfig;
  activePointKey?: string | null;
  selectedFields?: string[];
}) {
  let tooltipContent: ITooltipContent = {};

  for (let collection of data) {
    const groupConfig = getGroupConfig({
      collection,
      groupingSelectOptions,
      groupingNames,
      configData,
    });

    const item = collection.data.find((item) => item.key === activePointKey);

    if (item) {
      tooltipContent = {
        name: item.name,
        context: item.context,
        step: item.step,
        index: item.index,
        caption: item.caption,
        images_name: item.name,
        groupConfig,
        run: item.run,
      };
    }
  }

  const selectedProps: ITooltipContent['selectedProps'] = selectedFields.reduce(
    (acc: { [key: string]: string }, param: string) => {
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
    },
    {},
  );

  return { ...tooltipContent, selectedProps };
}

export default getTooltipContent;
