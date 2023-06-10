import { Tuple } from 'types/core/shared';

export type GroupedSequencesSearchQueryParams = {
  /**
   * Number of points
   * i.e. if tracked metric count is 1000, and p is 500, this key represents how many points do you want to load
   */
  p?: number;
  /**
   * The string of query. Query should be compatible with AimQL
   * i.e.
   * ```python
   *    run.hparams.batch_size < 32 and run.hparams.learning_rate > 0.001
   * ```
   */
  q?: string;
  /**
   * This flag is using when need to follow to the progress of streaming data
   */
  report_progress?: boolean;

  /**
   * This parameter is used to indicate the range of records by index form index1 to index2 or "index1:index2"
   */
  index_range?: Tuple<number> | string;

  /**
   * This parameter is used to indicate the range of records by step form index1 to index2 or "index1:index2"
   */
  record_range?: Tuple<number> | string;

  /**
   * This parameter is used to for simple sampling, indicates how many steps want to load including their objects
   */
  record_density?: number | string;

  /**
   * This parameter is used to for simple sampling, indicates how many objects want to load
   */
  index_density?: number | string;

  exclude_params?: boolean;

  exclude_traces?: boolean;

  /**
   * This parameter is used to align metrics by custom metric
   */
  x_axis?: string;
};
