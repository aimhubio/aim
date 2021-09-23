import * as analytics from 'services/analytics';

import { AlignmentOptions } from 'config/alignment/alignmentOptions';
import { AlignmentNotificationsEnum } from 'config/notification-messages/notificationMessages';
import metricsService from 'services/api/metrics/metricsService';
import { IAlignMetricsDataParams } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import getRunData from './getRunData';
import onNotificationAdd from './onNotificationAdd';

export default async function onAlignmentMetricChange<M extends State>(
  metric: string,
  model: IModel<M>,
) {
  const modelState = model.getState();
  const configData = modelState?.config;
  if (configData?.chart) {
    configData.chart = {
      ...configData.chart,
      alignmentConfig: { metric, type: AlignmentOptions.CUSTOM_METRIC },
    };
    model.setState({ config: configData });
  }
  if (modelState?.rawData && configData) {
    model.setState({ requestIsPending: true });
    const runs: Array<{ run_id: string; traces: any }> =
      modelState.rawData?.map((item) => {
        const traces = item.traces.map(
          ({ context, metric_name, slice }: any) => ({
            context,
            metric_name,
            slice,
          }),
        );
        return {
          run_id: item.hash,
          traces,
        };
      });

    const reqBody: IAlignMetricsDataParams = {
      align_by: metric,
      runs,
    };
    const stream = await metricsService.fetchAlignedMetricsData(reqBody).call();
    const runData = await getRunData(stream);
    let missingTraces = false;
    const rawData: any = model.getState()?.rawData?.map((item, index) => {
      return {
        ...item,
        traces: item.traces.map((trace: any, ind: number) => {
          let x_axis_iters = runData[index]?.[ind]?.x_axis_iters || null;
          let x_axis_values = runData[index]?.[ind]?.x_axis_iters || null;
          if (!x_axis_iters || !x_axis_values) {
            missingTraces = true;
          }
          let data = {
            ...trace,
            ...runData[index][ind],
          };
          return data;
        }),
      };
    });
    if (missingTraces) {
      onNotificationAdd(
        {
          id: Date.now(),
          severity: 'error',
          message: AlignmentNotificationsEnum.NOT_ALL_ALIGNED,
        },
        model,
      );
      configData.chart = {
        ...configData.chart,
        alignmentConfig: { metric: '', type: AlignmentOptions.STEP },
      };
    }
    // setModelData(rawData, configData);
  }
  analytics.trackEvent(
    '[MetricsExplorer][Chart] Align X axis by another metric',
  );
}
