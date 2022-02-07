/**
 * @see README.md for more details
 */
/* eslint-disable no-console */

import * as Comlink from 'comlink';

// eslint-disable-next-line import/no-webpack-loader-syntax
import LUWorker from 'comlink-loader!../Worker';

import { getDataFromTransferable } from '../utils';

const embeddedAppNames = {
  runs: {
    name: 'Runs',
    endpoint: 'runs/search/run',
  },
  metrics: {
    name: 'Metrics',
    endpoint: 'runs/search/metric',
  },
  params: {
    name: 'Params',
    endpoint: 'runs/search/run',
  },
  scatters: {
    name: 'Scatters',
    endpoint: 'runs/search/run',
  },
};

class UpdateService {
  constructor(appName, responseListener, delay) {
    this.appName = appName;
    this.delay = delay;
    this.responseListener = responseListener;

    this.instance = new LUWorker();
    this.instance.replaceBasePath(window.API_BASE_PATH);
    this.instance.setConfig(
      appName,
      embeddedAppNames[this.appName].endpoint,
      delay,
      process.env.NODE_ENV === 'development',
    );
    this.instance.subscribeToApiCallResult(
      Comlink.proxy(this.responseHandler.bind(this)),
    );
  }

  async stop() {
    if (this.inProgress) {
      try {
        const stopResult = await this.instance.stop();
        this.inProgress = false;
        return stopResult;
      } catch (e) {
        console.log("---- couldn't stop worker");
      }
    }
  }

  start(params) {
    this.inProgress = true;
    this.instance
      .start(params)
      .then()
      .catch((e) => {
        console.log('worker start exception --> ', e);
      });
  }

  responseHandler(data) {
    const obj = getDataFromTransferable(data);

    this.responseListener(obj);
  }

  changeDelay(delay) {
    this.stop()
      .catch(() => {
        console.log("---- couldn't change config");
      })
      .finally(() => {
        this.instance.setConfig(
          this.appName,
          embeddedAppNames[this.appName].endpoint,
          delay,
          process.env.NODE_ENV === 'development',
        );
      });
  }

  clear() {
    this.stop().finally(() => {
      this.instance.close();
      this.instance[Comlink.releaseProxy]();
    });
  }
}

export default UpdateService;
