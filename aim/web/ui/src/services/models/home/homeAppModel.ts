import projectsService from 'services/api/projects/projectsService';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import { getItem, setItem } from 'utils/storage';

import createModel from '../model';

const model = createModel<any>({});

function getActivityData() {
  const { call, abort } = projectsService.fetchActivityData();
  return {
    call: () =>
      call().then((data: any) => {
        model.setState({
          activityData: data,
        });
      }),
    abort,
  };
}

function onSendEmail(data: object): Promise<any> {
  return fetch('https://formspree.io/f/xeqvdval', {
    method: 'Post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(async (res) => await res.json())
    .then((data) => {
      if (data.ok) {
        onNotificationAdd({
          severity: 'success',
          message: 'Email Successfully sent',
          id: Date.now(),
        });
        model.setState({ askEmailSent: true });
        setItem('askEmailSent', true);
      } else {
        onNotificationAdd({
          severity: 'error',
          message: 'Please enter valid email',
          id: Date.now(),
        });
      }
      return data;
    });
}
function initialize() {
  model.init();
  const isAskEmailSent: boolean = getItem('askEmailSent') === 'true';
  model.setState({ askEmailSent: isAskEmailSent });
}

function onNotificationDelete(id: number) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData].filter((i) => i.id !== id);
  model.setState({ notifyData });
}

function onNotificationAdd(notification: INotification) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData, notification];
  model.setState({ notifyData });
  setTimeout(() => {
    onNotificationDelete(notification.id);
  }, 3000);
}

const homeAppModel = {
  ...model,
  initialize,
  getActivityData,
  onSendEmail,
  onNotificationDelete,
};

export default homeAppModel;
