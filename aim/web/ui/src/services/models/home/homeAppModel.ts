import projectsService from 'services/api/projects/projectsService';

import exceptionHandler from 'utils/app/exceptionHandler';
import onNotificationAdd from 'utils/app/onNotificationAdd';
import onNotificationDelete from 'utils/app/onNotificationDelete';
import { getItem, setItem } from 'utils/storage';

import createModel from '../model';

const model = createModel<any>({});

let activityRequestRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<unknown>;
  abort: () => void;
};

function getActivityData() {
  const { call, abort } = projectsService.fetchActivityData();
  return {
    call: () =>
      call((detail: any) => {
        exceptionHandler({ detail, model });
      }).then((data: any) => {
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
          notification: {
            severity: 'success',
            messages: ['Email Successfully sent'],
            id: Date.now(),
          },
          model,
        });
        model.setState({ askEmailSent: true });
        setItem('askEmailSent', true);
      } else {
        onNotificationAdd({
          notification: {
            severity: 'error',
            messages: ['Please enter valid email'],
            id: Date.now(),
          },
          model,
        });
      }
      return data;
    });
}
function initialize() {
  model.init();
  activityRequestRef = getActivityData();
  try {
    activityRequestRef.call((detail) => {
      exceptionHandler({ detail, model });
    });
  } catch (err: any) {
    onNotificationAdd({
      notification: {
        messages: [err.message],
        severity: 'error',
        id: Date.now(),
      },
      model,
    });
  }
  const isAskEmailSent: boolean = getItem('askEmailSent') === 'true';
  model.setState({ askEmailSent: isAskEmailSent });
}

function onHomeNotificationDelete(id: number) {
  onNotificationDelete({
    model,
    id,
  });
}

function destroy() {
  model.destroy();
  activityRequestRef.abort();
}

const homeAppModel = {
  ...model,
  destroy,
  initialize,
  getActivityData,
  onSendEmail,
  onHomeNotificationDelete,
};

export default homeAppModel;
