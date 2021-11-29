import { appInitialConfig, createAppModel } from 'services/models/explorer';

const correlationsAppModel = createAppModel(
  appInitialConfig.CORRELATIONS,
) as any;

export default correlationsAppModel;
