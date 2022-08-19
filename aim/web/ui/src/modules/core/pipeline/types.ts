export enum PipelinePhasesEnum {
  Fetching = 'fetching',
  Decoding = 'decoding',
  Adopting = 'adopting',
  Grouping = 'grouping',
  Waiting = 'waiting',
}

export type StatusChangeCallback = (status: PipelinePhasesEnum) => void;

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export enum GroupType {
  ROW = 'rows',
  COLUMN = 'columns',
  COLOR = 'color',
}

export type GroupOptions = {
  type: GroupType;
  fields: string[];
  orders?: Order[];
  applier?: Function;
};

export type BettaGroupOption = {
  type: GroupType;
  fields: string[];
  orders: Order[];
};

export type Group = { [key: string]: any };

export type GroupValue = { [key: string]: any };
