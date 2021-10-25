import LiveUpdateService from './examples/LiveUpdateBridge.example';
import { createTransferableData, getDataFromTransferable } from './utils';
import { WorkerApiCallResultSubscriber } from './types';

export { createTransferableData, getDataFromTransferable };

export type Subscriber = WorkerApiCallResultSubscriber;

export default LiveUpdateService;
