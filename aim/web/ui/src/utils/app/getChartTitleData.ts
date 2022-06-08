import _ from 'lodash-es';
import moment from 'moment';

import { DATE_WITH_SECONDS } from 'config/dates/dates';

import {
  IChartTitle,
  IChartTitleData,
  IGroupingSelectOption,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import { formatValue } from '../formatValue';
import getValueByField from '../getValueByField';

export default function getChartTitleData<D, M extends State>({
  processedData,
  groupingSelectOptions,
  model,
}: {
  processedData: IMetricsCollection<D>[];
  groupingSelectOptions: IGroupingSelectOption[];
  model: IModel<M>;
}): IChartTitleData {
  if (!processedData) {
    return {};
  }
  const groupData = model.getState()?.config?.grouping;
  let chartTitleData: IChartTitleData = {};
  processedData.forEach((metricsCollection) => {
    if (!chartTitleData[metricsCollection.chartIndex]) {
      chartTitleData[metricsCollection.chartIndex] = groupData.chart.reduce(
        (acc: IChartTitle, groupItemKey: string) => {
          if (metricsCollection.config?.hasOwnProperty(groupItemKey)) {
            const value = metricsCollection.config[groupItemKey];
            if (
              groupItemKey === 'run.props.creation_time' ||
              groupItemKey === 'run.props.end_time'
            ) {
              acc[getValueByField(groupingSelectOptions || [], groupItemKey)] =
                formatValue(
                  !_.isNil(value) && typeof value === 'number'
                    ? moment(value * 1000).format(DATE_WITH_SECONDS)
                    : value,
                );
            } else {
              acc[getValueByField(groupingSelectOptions || [], groupItemKey)] =
                formatValue(value);
            }
          }
          return acc;
        },
        {},
      );
    }
  });
  return chartTitleData;
}
