export enum PipelinePhasesEnum {
  Fetching = 'fetching',
  Decoding = 'decoding',
  Adopting = 'adopting',
  Grouping = 'grouping',
  Waiting = 'waiting',
}

export type StatusChangeCallback = (status: PipelinePhasesEnum) => void;
