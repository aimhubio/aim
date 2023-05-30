export interface ILogRecordItemProps {
  style?: React.CSSProperties;
  index: number;
  data: any;
}

export type RecordType = {
  /**
   * The record message
   * @type {string}
   * @example 'Error log recored no: 999"'
   */
  message: string;
  /**
   * The date of the record
   * @type {string}
   * @example '2021-01-01 12:00:00'
   */
  date: string;
  /**
   * The hash of the record
   * @type {string}
   * @example '5e9f1b9b-7c1a-4b5a-8f0c-8c1c1b9b7c1a'
   */
  hash: string;
  /**
   * The record extra params
   * @type {ListItemType}
   * @example Month
   */
  itemType: ListItemType;
  /**
   * The record creation time
   * @type {number}
   * @example 1610000000
   */
  creation_time: number;
  /**
   * The run id
   * @type {string}
   * @example '5e9f1b9b-7c1a-4b5a-8f0c-8c1c1b9b7c1a'
   */
  runId: string;
  /**
   * The record type
   * @type {string}
   * @example 'ERROR'
   */
  type: 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
};

export type ListItemType = 'MONTH' | 'DAY' | 'RECORD';
