import { appInitialConfig, createAppModel } from 'services/models/explorer';

const metricAppModel = createAppModel(appInitialConfig.METRICS) as any;

export default metricAppModel;
