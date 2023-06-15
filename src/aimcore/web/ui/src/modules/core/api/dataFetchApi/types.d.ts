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

  exclude_params?: boolean;

  exclude_traces?: boolean;

  /**
   * This parameter is used to align metrics by custom metric
   */
  x_axis?: string;
};
