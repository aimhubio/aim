import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';

import appsService from 'services/api/apps/appsService';

import { IDashboardData } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import exceptionHandler from './exceptionHandler';
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
    try {
      appsService
        .updateApp(id, { state: configData, type: appName.toLowerCase() })
        .call((detail: any) => {
          exceptionHandler({ detail, model });
        })
        .then((res: IDashboardData | any) => {
          if (res.id) {
            onNotificationAdd({
              notification: {
                id: Date.now(),
                severity: 'success',
                messages: [BookmarkNotificationsEnum.UPDATE],
              },
              model,
            });
          }
        });
    } catch (err: any) {
      onNotificationAdd({
        model,
        notification: {
          id: Date.now(),
          messages: [err.message],
          severity: 'error',
        },
      });
    }
  }
}
