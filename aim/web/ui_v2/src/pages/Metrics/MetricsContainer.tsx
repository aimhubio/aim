import React from 'react';

import useModel from 'hooks/model/useModel';
import metricsCollectionModel from 'services/models/metrics/metricsCollectionModel';
import Metrics from './Metrics';

const projectDataRequest = metricsCollectionModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const metricsCollectionData = useModel(metricsCollectionModel);
  React.useEffect(() => {
    projectDataRequest.call();
    return () => {
      projectDataRequest.abort();
    };
  }, []);

  React.useEffect(() => {
    console.log(metricsCollectionData);
  }, [metricsCollectionData]);

  return <Metrics />;
}

export default MetricsContainer;
