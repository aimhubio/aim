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
