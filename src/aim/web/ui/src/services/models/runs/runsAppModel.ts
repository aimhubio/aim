import { appInitialConfig, createAppModel } from 'services/models/explorer';

const runsAppModel = createAppModel(appInitialConfig.RUNS) as any;

export default runsAppModel;
