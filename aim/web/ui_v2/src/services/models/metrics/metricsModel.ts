import createSeriesModel from './seriesModel';

function createMetricsModel(params: { series: unknown[] }) {
  return {
    ...params,
    series: params.series.map(createSeriesModel),
  };
}

export default createMetricsModel;
