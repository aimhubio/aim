import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';

import * as analytics from 'services/analytics';
import appsService from 'services/api/apps/appsService';
import dashboardService from 'services/api/dashboard/dashboardService';

import {
  IAppData,
  IDashboardData,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

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
  if (configData) {
    const app: IAppData | any = await appsService
      .createApp({ state: configData, type: appName.toLowerCase() })
      .call();
    if (app.id) {
      const bookmark: IDashboardData = await dashboardService
        .createDashboard({ app_id: app.id, name, description })
        .call();
      if (bookmark.name) {
        onNotificationAdd({
          notification: {
            id: Date.now(),
            severity: 'success',
            message: BookmarkNotificationsEnum.CREATE,
          },
          model,
        });
      } else {
        onNotificationAdd({
          notification: {
            id: Date.now(),
            severity: 'error',
            message: BookmarkNotificationsEnum.ERROR,
          },
          model,
        });
      }
    }
  }
  analytics.trackEvent(`[${appName}Explorer] Create bookmark`);
}
