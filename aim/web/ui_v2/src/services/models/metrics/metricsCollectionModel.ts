import metricsService from 'services/api/metrics/metricsService';
import createModel from '../model';
import createMetricsModel from './metricsModel';

const model = createModel({});

function getMetricsData() {
  const { call, abort } = metricsService.getMetricsData();
  model.init();
  return {
    call: () =>
      call().then((data: any) => {
        model.setState({
          rawData: data,
          collection: [
            {
              metrics: data.map(createMetricsModel),
            },
          ],
        });
      }),
    abort,
  };
}

const metricsCollectionModel = {
  ...model,
  getMetricsData,
};

export default metricsCollectionModel;
