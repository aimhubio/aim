import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';

import * as analytics from 'services/analytics';
import appsService from 'services/api/apps/appsService';
import dashboardService from 'services/api/dashboard/dashboardService';

import {
  IAppData,
  IDashboardData,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import exceptionHandler from './exceptionHandler';
import onNotificationAdd from './onNotificationAdd';

export default async function onBookmarkCreate<M extends State>({
  name,
  description,
  model,
  appName,
}: {
  name: string;
  description: string;
  model: IModel<M>;
  appName: string;
}): Promise<void> {
  const configData = model?.getState()?.config;
  try {
    if (configData) {
      const app: IAppData | any = await appsService
        .createApp({
          state: configData,
          type: appName.toLowerCase(),
        })
        .call((detail: any) => {
          exceptionHandler({ detail, model });
        });
      if (app.id) {
        const bookmark: IDashboardData = await dashboardService
          .createDashboard({ app_id: app.id, name, description })
          .call((detail: any) => {
            exceptionHandler({ detail, model });
          });
        if (bookmark.name) {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              severity: 'success',
              messages: [BookmarkNotificationsEnum.CREATE],
            },
            model,
          });
        } else {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              severity: 'error',
              messages: [BookmarkNotificationsEnum.ERROR],
            },
            model,
          });
        }
      }
    }
  } catch (err: any) {
    onNotificationAdd({
      notification: {
        id: Date.now(),
        messages: [err.message],
        severity: 'error',
      },
      model,
    });
  }
  analytics.trackEvent(`[${appName}Explorer] Create bookmark`);
}
