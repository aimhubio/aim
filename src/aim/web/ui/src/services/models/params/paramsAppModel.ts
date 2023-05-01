import { appInitialConfig, createAppModel } from 'services/models/explorer';

const paramsAppModel = createAppModel(appInitialConfig.PARAMS) as any;

export default paramsAppModel;
