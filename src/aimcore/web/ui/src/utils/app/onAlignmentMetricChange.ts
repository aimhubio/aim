import { AlignmentNotificationsEnum } from 'config/notification-messages/notificationMessages';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import * as analytics from 'services/analytics';
import metricsService from 'services/api/metrics/metricsService';

import { IAlignMetricsDataParams } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { AlignmentOptionsEnum } from '../d3';

import getRunData from './getRunData';
import onNotificationAdd from './onNotificationAdd';
import updateURL from './updateURL';
import setRequestProgress from './setRequestProgress';

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
      axesScaleRange: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleRange,
      zoom: { ...configData.chart.zoom, history: [] },
    };

    model.setState({ config: configData });
    updateURL({ configData, appName });
  }
  if (modelState?.rawData && configData) {
    model.setState({ requestStatus: RequestStatusEnum.Pending });
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
      const runData = await getRunData(stream, (progress) =>
        setRequestProgress(model, progress),
      );
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
            messages: [AlignmentNotificationsEnum.NOT_ALL_ALIGNED],
          },
          model,
        });
        configData.chart = {
          ...configData.chart,
          alignmentConfig: { metric: '', type: AlignmentOptionsEnum.STEP },
        };
        model.setState({ requestStatus: RequestStatusEnum.BadRequest });
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
        model.setState({ requestStatus: RequestStatusEnum.BadRequest });
        updateModelData(configData, true);
      }
    }
  }
  analytics.trackEvent(
    // @ts-ignore
    `${ANALYTICS_EVENT_KEYS[appName].chart.controls.changeXAxisProperties}, Align X axis by another metric`,
  );
}
