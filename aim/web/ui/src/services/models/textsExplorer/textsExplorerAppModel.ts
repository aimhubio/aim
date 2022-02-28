import _ from 'lodash-es';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import appsService from 'services/api/apps/appsService';

import { IAppData } from 'types/services/models/metrics/metricsAppModel';

import { getCompatibleSelectConfig } from 'utils/app/getCompatibleSelectConfig';
import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';

import createModel from '../model';

const model = createModel<Partial<any>>({
  requestStatus: RequestStatusEnum.NotRequested,
  searchButtonDisabled: false,
  applyButtonDisabled: true,
  selectFormData: {
    options: undefined,
    suggestions: [],
  },
});

function getConfig() {}

let appRequestRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<IAppData>;
  abort: () => void;
};

let textsRequestRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<IAppData>;
  abort: () => void;
};

function initialize(appId: string): void {
  model.init();
}

function getAppConfigData(appId: string) {
  if (appRequestRef) {
    appRequestRef.abort();
  }
  appRequestRef = appsService.fetchApp(appId);
  return {
    call: async () => {
      const appData = await appRequestRef.call((detail: any) => {
        exceptionHandler({ detail, model });
      });
      let select = appData?.state?.select;
      if (select) {
        const compatibleSelectConfig = getCompatibleSelectConfig(
          ['texts'],
          select,
        );
        appData.state = {
          ...appData.state,
          select: {
            ...compatibleSelectConfig,
          },
        };
      }
      const configData: any = _.merge(getConfig(), appData.state);
      model.setState({ config: configData });
    },
    abort: appRequestRef.abort,
  };
}

function resetModelState() {}

function abortRequest(): void {
  if (textsRequestRef) {
    textsRequestRef.abort();
  }
  model.setState({
    requestStatus: RequestStatusEnum.Ok,
  });
  onNotificationAdd({
    notification: {
      id: Date.now(),
      severity: 'info',
      messages: ['Request has been cancelled'],
    },
    model,
  });
}

const imagesExploreAppModel = {
  ...model,
  initialize,
  abortRequest,
  onNotificationAdd,
  getAppConfigData,
};

export default imagesExploreAppModel;
