import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';

import * as analytics from 'services/analytics';
import appsService from 'services/api/apps/appsService';

import { IDashboardData } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import onNotificationAdd from './onNotificationAdd';

export default function onBookmarkUpdate<M extends State>({
  id,
  model,
  appName,
}: {
  id: string;
  model: IModel<M>;
  appName: string;
}): void {
  const configData = model.getState()?.config;
  if (configData) {
    appsService
      .updateApp(id, { state: configData, type: appName.toLowerCase() })
      .call()
      .then((res: IDashboardData | any) => {
        if (res.id) {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              severity: 'success',
              message: BookmarkNotificationsEnum.UPDATE,
            },
            model,
          });
        }
      });
  }
  analytics.trackEvent(`[${appName}Explorer] Update bookmark`);
}
