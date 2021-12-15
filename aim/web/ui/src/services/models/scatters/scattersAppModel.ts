import { appInitialConfig, createAppModel } from 'services/models/explorer';

const scattersAppModel = createAppModel(appInitialConfig.SCATTERS) as any;

export default scattersAppModel;
