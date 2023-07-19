/**
 * type RunsSearchQueryParams
 * The request query options type of GET /runs/search
 */

export type RunsSearchQueryParams = {
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
   * This parameter is used to indicate the start of the range slicing
   */
  start?: string;

  /**
   * This parameter is used to indicate the end of the range slicing
   */
  stop?: string;

  exclude_params?: boolean;
  exclude_traces?: boolean;

  /**
   * This parameter is used to align metrics by custom metric
   */
  x_axis?: string;
};

/**
 * type RunsSearchResult
 * The response type of /runs/search
 * This data is used by explorer visualizations
 */
export type RunsSearchResult = ReadableStream;

/**
 * if report_progress is true, there are some runs describing the progress during the streaming
 * the request parser should use this type to pass argument as requestProgressCallback
 */
export interface IRunProgressObject {
  matched: number;
  checked: number;
  trackedRuns: number;
}

/**
 * Request body type for custom metric alignment
 */
export interface IAlignMetricsData {
  align_by: string;
  runs: {
    run_id: string;
    traces: {
      context: { [key: string]: unknown };
      name: string;
      slice: number[];
    }[];
  }[];
}
