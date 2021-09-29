/**
 * @author AimHub
 * @see README.md for more details
 */
// eslint-disable-next-line import/no-webpack-loader-syntax
import LUWorker from 'comlink-loader!../Worker';
import * as Comlink from 'comlink';
import { getDataFromTransferable } from '../utils';

class UpdateService {
  constructor(name, model, responseListener) {
    this.worker = new LUWorker();
    this.model = model;
    this.mainRequestIsPending = false;
    this.responseListener = responseListener;
  }

  async init() {
    try {
      this.instance = this.worker;
      this.instance.setConfig('Runs', 'runs/search/run', 4000, true);

      this.model.subscribe('UPDATE', this.subscribeToModel.bind(this));
      this.instance.subscribeToApiCallResult(
        Comlink.proxy(this.responseHandler.bind(this)),
      );
    } catch (e) {}
  }

  responseHandler(data) {
    const obj = getDataFromTransferable(data);
    console.log(obj);
    this.responseListener(obj);
  }

  subscribeToModel() {
    const modelState = this.model.getState();
    const newQuery = modelState?.config?.select?.query;

    if (modelState.requestIsPending) {
      if (modelState.requestIsPending !== this.mainRequestIsPending) {
        console.log('stop worker');

        this.mainRequestIsPending = true;
      }
      // stopWorker;
      this.stopWorker().then().catch();
    } else if (this.mainRequestIsPending) {
      console.log('start worker');
      this.mainRequestIsPending = false;
      // start workers;
      this.startWorker({ q: newQuery, limit: 50 });
    }
  }

  async stopWorker() {
    this.instance
      .stop()
      .then()
      .catch((e) => {
        console.log('workers stop exception --> ', e);
      });
  }

  startWorker(params) {
    this.instance
      .start(params)
      .then()
      .catch((e) => {
        console.log('worker start exception --> ', e);
      });
  }

  remove() {
    this.stopWorker()
      .then(() => {
        this.instance.close();
        this.instance[Comlink.releaseProxy]();
      })
      .catch(() => {
        this.instance.close();
        this.instance[Comlink.releaseProxy]();
      });
  }
}

export default UpdateService;
