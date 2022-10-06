// The response  body of GET /tags
export interface ITagData {
  /**
   * Tag name
   * @example "test"
   * @type string
   */
  name: string;
  /**
   * Tag color
   * @example "#000000"
   * @type string
   */
  color: string | null;
  /**
   * Tag id
   * @example '3fa85f64-5717-4562-b3fc-2c963f66afa6'
   * @type string
   */
  id: string;
  /**
   * Tag description
   * @example "tag description"
   * @type string
   */
  description: string;
  /**
   * Tag run count which is associated with this tag
   * @example 1
   * @type number
   */
  run_count: number;
  /**
   * Tag archived status
   * @example false
   * @type boolean
   */
  archived: boolean;
}

// The request body type of POST /tags
export interface ICreateTagBody {
  /**
   * Tag name
   * @example "test"
   * @type string
   */
  name: string;
  /**
   * Tag color
   * @example "#000000"
   * @type string
   */
  color: string;
  /**
   * Tag description
   * @example "tag description"
   * @type string
   */
  description: string;
}

// The response body of the created tag
export interface ICreateTagResult {
  /**
   * Tag id
   * @example '3fa85f64-5717-4562-b3fc-2c963f66afa6'
   * @type string
   */
  id: string;
  /**
   * Response status
   * @example "OK"
   * @type string
   */
  status: string;
}

export interface IUpdateTagBody extends Partial<ICreateTagBody> {
  archived?: boolean;
}

// The response of getting runs by tag id
export interface IGetTagRunsResult {
  /**
   * Tag id
   * @example '3fa85f64-5717-4562-b3fc-2c963f66afa6'
   * @type string
   */
  id: string;
  /**
   * Runs which are associated with this tag
   * @example [{creation_time: 123, end_time: 123, experiment: 'test', name: 'test', run_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6'}]
   * @type ITagRun[]
   * @see ITagRun
   */
  runs: ITagRun[];
}

// The run data which is associated with a tag
type ITagRun = {
  /**
   * Run id
   * @example '1af2657'
   * @type string
   */
  run_id: string;
  /**
   * Run name
   * @example 'run name'
   * @type string
   */
  name: string;
  /**
   * Run experiment
   * @example 'experiment name'
   * @type string
   */
  experiment: string;
  /**
   * Run creation time
   * @example 1632172882.096673
   * @type number
   */
  creation_time: number;
  /**
   * Run end time
   * @example 1632172882.350732
   * @type number
   */
  end_time: number;
};
