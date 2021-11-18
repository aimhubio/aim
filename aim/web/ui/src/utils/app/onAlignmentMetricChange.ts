import { AlignmentNotificationsEnum } from 'config/notification-messages/notificationMessages';

import * as analytics from 'services/analytics';
import metricsService from 'services/api/metrics/metricsService';

import { IAlignMetricsDataParams } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { AlignmentOptionsEnum } from '../d3';

import getRunData from './getRunData';
import onNotificationAdd from './onNotificationAdd';
import updateURL from './updateURL';

export default async function onAlignmentMetricChange<M extends State>({
  metric,
  model,
  appName,
  updateModelData,
  setModelData,
}: {
  metric: string;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
  setModelData: any;
}) {
  const modelState = model.getState();
  const configData = modelState?.config;
  if (configData?.chart) {
    configData.chart = {
      ...configData.chart,
      alignmentConfig: { metric, type: AlignmentOptionsEnum.CUSTOM_METRIC },
    };
    model.setState({ config: configData });
    updateURL({ configData, appName });
  }
  if (modelState?.rawData && configData) {
    model.setState({ requestIsPending: true });
    const runs: Array<{ run_id: string; traces: any }> =
      modelState.rawData?.map((item) => {
        const traces = item.traces.map(({ context, name, slice }: any) => ({
          context,
          name,
          slice,
        }));
        return {
          run_id: item.hash,
          traces,
        };
      });

    const reqBody: IAlignMetricsDataParams = {
      align_by: metric,
      runs,
    };
    try {
      const stream = await metricsService
        .fetchAlignedMetricsData(reqBody)
        .call();
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
        onNotificationAdd({
          notification: {
            id: Date.now(),
            severity: 'error',
            message: AlignmentNotificationsEnum.NOT_ALL_ALIGNED,
          },
          model,
        });
        configData.chart = {
          ...configData.chart,
          alignmentConfig: { metric: '', type: AlignmentOptionsEnum.STEP },
        };
      }
      setModelData(rawData, configData);
    } catch (ex: any) {
      if (ex.name === 'AbortError') {
        // Abort Error
      } else {
        configData.chart = {
          ...configData.chart,
          alignmentConfig: {
            metric,
            type: AlignmentOptionsEnum.STEP,
          },
        };
        model.setState({ requestIsPending: false });
        updateModelData(configData, true);
        console.log('Unhandled error: ', ex);
      }
    }
  }
  analytics.trackEvent(
    `[${appName}Explorer][Chart] Align X axis by another metric`,
  );
}
