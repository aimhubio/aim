// import { initialCode } from 'pages/Report/newReportCode';

import appsService from 'services/api/apps/appsService';

import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';
import onNotificationDelete from 'utils/app/onNotificationDelete';

import createModel from '../model';

let reportRequestRef: {
  call: () => void;
  abort: () => void;
};

const model = createModel<any>({
  isLoading: true,
  report: {
    name: 'New Report',
    description: '',
    code: '',
  },
  notifyData: [],
});

function getReportData(reportId: string) {
  const { call, abort } = appsService.fetchApp(reportId);

  return {
    call: () => {
      call((detail: any) => {
        exceptionHandler({ detail, model: model as any });
      }).then(async (data: any) => {
        try {
          model.setState({
            isLoading: false,
            report: {
              ...data,
              ...data.state,
            },
          });
        } catch (err: any) {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              messages: [err.message],
              severity: 'error',
            },
            model: model as any,
          });
        }
        model.setState({ isLoading: false });
      });
    },
    abort,
  };
}

async function createReport(name: string, description: string, code: string) {
  try {
    return await appsService
      .createApp({
        state: {
          name,
          description,
          code: code,
          report: true,
        } as any,
        type: 'report',
      })
      .call((detail: any) => {
        exceptionHandler({ detail, model });
      })
      .then((data: any) => {
        model.setState({
          report: data,
        });
        onNotificationAdd({
          notification: {
            id: Date.now(),
            severity: 'success',
            messages: ['Report successfully created'],
          },
          model,
        });
        return data;
      });
  } catch (err: any) {
    onNotificationAdd({
      notification: {
        id: Date.now(),
        messages: [err.message],
        severity: 'error',
      },
      model: model as any,
    });
  }
}

async function updateReport(reportId: string, update: Record<string, unknown>) {
  try {
    await appsService
      .updateApp(reportId, {
        state: update,
        type: 'report',
      })
      .call((detail: any) => {
        exceptionHandler({ detail, model });
      })
      .then((data: any) => {
        model.setState({
          report: data,
        });
      });

    onNotificationAdd({
      notification: {
        id: Date.now(),
        severity: 'success',
        messages: ['Report successfully updated'],
      },
      model,
    });
  } catch (err: any) {
    onNotificationAdd({
      notification: {
        id: Date.now(),
        messages: [err.message],
        severity: 'error',
      },
      model: model as any,
    });
  }
}

function onReportNotificationDelete(id: number) {
  onNotificationDelete({ id, model });
}

function initialize(reportId: string) {
  model.init();
  if (reportId === 'new') {
    model.setState({
      isLoading: false,
      report: {
        name: 'New Report',
        description: '',
        code: '',
        report: true,
      },
    });
  } else {
    try {
      reportRequestRef = getReportData(reportId);
      reportRequestRef.call();
    } catch (err: any) {
      onNotificationAdd({
        notification: {
          id: Date.now(),
          messages: [err.message],
          severity: 'error',
        },
        model: model as any,
      });
      model.setState({
        isLoading: false,
      });
      reportRequestRef.abort();
    }
  }
}

function destroy() {
  reportRequestRef?.abort();
  model.destroy();
}

const reportAppModel = {
  ...model,
  initialize,
  destroy,
  getReportData,
  createReport,
  updateReport,
  onReportNotificationDelete,
};

export default reportAppModel;
